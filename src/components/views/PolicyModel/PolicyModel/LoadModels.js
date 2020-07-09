import axios from 'axios'

// Implement simple cache in localstorage for model runs
// this version uses the state name as the key, that
// key may need to be expanded in the future to include
// interventions or other differences.

// oldest acceptable model in the cache
// (younger models will be used older will be deleted)
const LIFESPAN = 3 * 60 * 60 * 1000

// If the model versions do not match, drop the entire
// localStorage. This lets us clear all client caching
// if we push an incompatible update.
const MODEL_VERSION = '1'

// const API_URL = 'http://192.168.1.33:8000/'
// const API_URL = 'http://localhost:8000/'
// const API_URL = 'http://127.0.0.0:8000/'
const API_URL = 'http://amp-model-api.covidamp.org/'

// request a model from the server
// this should only happen if we
// don't already have a recent model locally
const requestModel = async state => {
  console.log('ModelCache: requesting model ' + state)
  const result = await axios(API_URL + 'state_base_model/' + state)

  const runData = parseModelDates(result.data)
  runData['dateRequested'] = new Date()

  // cache this model in case it's quickly requested again
  saveModel(runData)

  return runData
}

const reconstructInterventions = (model, runData) => {
  const newIntervention = runData.interventions.slice(-1)[0]
  runData['dateRequested'] = new Date(model.dateRequested)
  runData['cases'] = model.cases
  runData['deaths'] = model.deaths

  // check if model interventions include the latest,
  // if not, copy the array from the old cached model
  // and then add the latest intervention from the new one
  if (
    !model.interventions.find(
      inter => inter.startdate === newIntervention.startdate
    )
  ) {
    runData['interventions'] = [...model.interventions, newIntervention]
  }
  return runData
}

export const requestIntervention = async (state, intervention) => {
  let model = (await loadModels([state]))[0]

  await axios
    .post(API_URL + 'intervention_run/' + model.modelrun, intervention)
    .then(result => {
      const runData = parseModelDates(result.data)
      const newModel = reconstructInterventions(model, runData)

      // save new model
      console.log('ModelCache: added intervention to ' + state)
      saveModel(newModel)
    })
    .catch(async err => {
      console.log('ModelCache: no worker found')
      // if the server returns an error,
      // delete the base model and then
      // request a new base model.
      deleteModel(model)

      const newBaseModel = (await loadModels([state]))[0]

      await axios
        .post(
          API_URL + 'intervention_run/' + newBaseModel.modelrun,
          intervention
        )
        .then(result => {
          const runData = parseModelDates(result.data)
          const newModel = reconstructInterventions(newBaseModel, runData)

          // save new model
          console.log('ModelCache: added intervention to ' + state)
          saveModel(newModel)
        })
    })
}

// take a model run string and
// parse it, including fixing dates
const parseModelDates = runData => {
  runData.results.run = JSON.parse(runData.results[0].run).map(day => ({
    ...day,
    date: new Date(day.date),
  }))

  return runData
}

// save a model into local storage
// saveModel expects a parsed model, not the string
const saveModel = runData => {
  localStorage.setItem('MODEL_VERSION', MODEL_VERSION)

  const modelName =
    runData.dateRequested.toISOString() + '_' + runData.state + '_MR'

  // Browsers throw inconsistent errors, so catching everything...
  try {
    console.log('ModelCache: saving model ' + modelName)
    localStorage.setItem(modelName, JSON.stringify(runData))
  } catch (err) {
    // Delete oldest two models if there is an error
    const sortedKeys = Object.keys(localStorage).sort()
    console.log('ModelCache: deleting ' + sortedKeys[0])
    console.log('ModelCache: deleting ' + sortedKeys[1])
    localStorage.removeItem(sortedKeys[0])
    localStorage.removeItem(sortedKeys[1])

    // Save new model now that we've made room
    console.log('ModelCache: saving model ' + modelName)
    localStorage.setItem(modelName, JSON.stringify(runData))
  }
}

const deleteModel = model => {
  const modelName = model.dateRequested + '_' + model.state + '_MR'
  console.log('ModelCache: deleting model ' + modelName)
  localStorage.removeItem(modelName)
}

// function to strip out user-added interventions
export const clearState = async state =>
  // one-liner naieve solution
  //   deleteModel((await loadModels([state]))[0])
  // Better clearState function, clears locally
  {
    const model = (await loadModels([state]))[0]
    const resetModel = Object.assign({}, model)
    resetModel.interventions = model.interventions.filter(
      inter => new Date(inter.startdate) < new Date()
    )
    const counterfactualName = resetModel.interventions[0].system_name
    const interventionName = resetModel.interventions.slice(-1)[0].system_name

    resetModel.results = model.results.filter(run =>
      [counterfactualName, interventionName].includes(run.name)
    )

    // disconnecting from the server worker
    resetModel.modelrun = ''

    resetModel.dateRequested = new Date(model.dateRequested)
    saveModel(resetModel)
  }

// check if there is a sufficiently recent model run to use
// if not, request a model from the server.
export const loadModels = async states => {
  // this disables the whole cache for testing
  // localStorage.clear()

  // Model version check, dropping the whole localStorage
  if (MODEL_VERSION !== localStorage.getItem('MODEL_VERSION')) {
    console.log('New model version ' + MODEL_VERSION + ', dropping cache')
    localStorage.clear()
  }

  let models = await Promise.all(
    states.map(async state => {
      // console.log('ModelCache: loadModel ' + state);

      const stateModelNames = Object.keys(localStorage).filter(key =>
        key.endsWith(state + '_MR')
      )

      const now = new Date()
      const modelName = stateModelNames.find(modelName => {
        if (now - new Date(modelName.split('_')[0]) < LIFESPAN) {
          return true
        } else {
          // clean up too-old models
          console.log(
            'ModelCache: deleting ' + modelName + ' from localStorage'
          )
          localStorage.removeItem(modelName)
          return false
        }
      })

      if (modelName) {
        console.log('ModelCache: retrieving ' + modelName)
        const modelString = localStorage.getItem(modelName)
        return parseModelDates(JSON.parse(modelString))
      } else {
        return requestModel(state)
      }
    })
  )

  // console.log(models)
  return models
}
// setTimeout(() => {
//   requestIntervention('CO', {
//     name: 'First Intervention',
//     system_name: 'string',
//     description: 'string',
//     startdate: '2020-07-20',
//     params: { beta_mild: 0.0, beta_asymp: 0.0 },
//     intervention_type: 'intervention',
//   })
// }, 2000)
//
// setTimeout(() => {
//   requestIntervention('CO', {
//     name: 'Second Intervention',
//     system_name: 'test',
//     description: 'string',
//     startdate: '2020-09-08',
//     params: { beta_mild: 0.2, beta_asymp: 0.2 },
//     intervention_type: 'intervention',
//   })
// }, 5000)
//
// setTimeout(() => {
//   requestIntervention('CO', {
//     name: 'Third Intervention',
//     system_name: 'string',
//     description: 'string',
//     startdate: '2020-11-08',
//     params: { beta_mild: 0.4, beta_asymp: 0.4 },
//     intervention_type: 'intervention',
//   })
// }, 9000)

export default loadModels
