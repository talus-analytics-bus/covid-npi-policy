# covid-npi-policy
A dashboard to track and provide data on COVID-19 non-pharmaceutical interventions (NPI) policies enacted in different locations.
# How to start React development server
1. Get file `.env.local` from Mike and add it to the root directory. Its contents are similar to the below, without redactions, and are needed for Mapbox maps to work:
    ```
    REACT_APP_MAPBOX_ACCESS_TOKEN=REDACTED
    ```
1. Add file `.env.development.local` containing the below. This file tells the development environment to use local URLs for API requests instead of the test site URLs. If you don't add this file, the test site URLs will be used.
**Note that, currently, the test site URL should be used for the model, which is why it is commented out below.**
    ```
    # REACT_APP_MODEL_API_URL=http://127.0.0.1:5000/
    REACT_APP_METRICS_API_URL=http://localhost:5002
    REACT_APP_API_URL=http://localhost:8002
    REACT_APP_ENV_NAME=env_development_local
    ```
1. Run `yarn install`.
1. Clone the API server repository `covid-npi-policy-api` [here](xxx) and start it, following the instructions in its `README.md`.
1. Run `yarn start` to start the frontend.