import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./documentation.module.scss";

// assets
import modelPng from "./../../../../assets/images/model.png";

const Documentation = ({ ...props }) => {
  // UTILITY FUNCTIONS // ---------------------------------------------------//
  // handle scrollTo for when endnote anchors are clicked
  const onClick = e => {
    const headerOffset = 190; // TODO get from SCSS
    let el;
    if (e.target.dataset.type === "ref") {
      const num = e.target.id.split("_ednref")[1];
      el = document.getElementById("_edn" + num);
      el.scrollIntoView();
    } else {
      const num = e.target.id.split("_edn")[1];
      el = document.getElementById("_ednref" + num);
      el.scrollIntoView();
    }
    window.scrollTo(window.scrollX, window.scrollY - headerOffset);
  };

  // PAGE JSX // ------------------------------------------------------------//
  return (
    <div className={styles.documentation}>
      <h2>Overview</h2>
      <p>
        The COVID Analysis and Mapping of Policies (AMP) is part of the
        COVID-Local suite of free resources developed for local decision-makers.
        The COVID AMP Policy and Plan Database includes a library of polices
        from US states and the District of Columbia, US local governments
        (counties, cities) and national governments globally.
      </p>
      <p>
        COVID AMP is an on-going research effort with data collection performed
        by researchers at the Georgetown University Center for Global Health
        Science and Security and Talus Analytics. As of July 2020, data are most
        complete for US states. Additional work is in progress to expand both to
        county-level data collection across the US and country-level data
        globally. In addition, a dataset of COVID-19-related plans published by
        US states and other organizations is also being collated and is
        available on the site.
      </p>
      <p>The site includes:</p>
      <ol>
        <li>
          A searchable, filterable database of all policies and plans in the
          dataset, including legal and governance analysis. The complete dataset
          can be downloaded in an Excel file format directly from the site. If
          you are interested in establishing an API or other direct access,
          please contact us at{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="mailto:outbreak@georgetown.edu"
          >
            outbreak@georgetown.edu
          </a>{" "}
          or{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="mailto:info@talusanalytics.com"
          >
            info@talusanalytics.com
          </a>
        </li>
        <li>
          An interactive policy map providing geospatial visualization of the
          policies implemented over time. Policies can be viewed by
          &ldquo;Distancing level&rdquo; (see Methods below for detailed
          information about these categories) and by key policy types. All
          policy maps include reference COVID-19 case counts, over time, either
          as new cases in the last 7 days or cumulative cases.
        </li>
        <li>
          An interactive tool to explore the intersection between policies and
          caseload for each US state. The tool also provides the ability to:
          <ol type="a">
            <li>Compare the effect of not having implemented any policies</li>
            <li>Evaluate new policy options given conditions in a state</li>
          </ol>
        </li>
      </ol>
      <p>
        This work and underlying AMP dataset is available for use under the
        Creative Commons Attribution By License agreement (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://creativecommons.org/licenses/by/4.0/"
        >
          https://creativecommons.org/licenses/by/4.0/
        </a>
        ), with appropriate reference and acknowledgement of the original
        research team, as available under the About section of{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://covid-local.org"
        >
          covid-local.org
        </a>{" "}
        and{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://covidamp.org"
        >
          covidamp.org
        </a>
        .
      </p>
      <p>
        In addition to direct download from the site, we are happy to work with
        your team to provide automated access <em>via</em> API or other data
        sharing method. Please contact us at{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="mailto:info@talusanalytics.com"
        >
          info@talusanalytics.com
        </a>
        &nbsp;for more information.
      </p>
      <h2>Annotated Policy Library</h2>
      <h3>Data coding process</h3>
      <p>
        To collect the data, the team first developed a custom data taxonomy and
        data dictionary to define key metadata and organize the dataset. These
        data are populated directly by the policy coding team into Airtable and
        transferred <em>via</em> API into a database on Amazon Web Services.
        These data may be accessed directly from the backend database{" "}
        <em>via</em> API upon request. The data dictionary with complete
        description of all metadata fields can be downloaded as an Excel file{" "}
        <a
          href={
            process.env.PUBLIC_URL + "/export/COVID AMP data dictionary.xlsx"
          }
        >
          here
        </a>
        . The complete dataset can be downloaded from the Policy data page from{" "}
        <Link target="_blank" to="/data">
          covidamp.org/data
        </Link>
        .
      </p>
      <p>
        For the purpose of this effort, policies are defined as
        government-issued and backed by legal authority or precedent. Plans
        included in the dataset are documents issued by a government,
        non-profit, for-profit, or higher education institution that provide
        recommended actions or guidelines, but do not necessarily have legal
        basis or authority.
      </p>
      <p>
        Policies are coded and tagged with the relevant metadata manually. Each
        policy is tagged with a series of descriptive attributes based on a
        review of the policy language, including (this is a representative
        subset—see data dictionary for complete description of data fields):
      </p>
      <ul>
        <li>Policy name and description</li>
        <li>
          Policy type (e.g., executive order, emergency declaration, statute,
          etc.)
        </li>
        <li>
          Categorical description of the scope of policy actions (e.g., social
          distancing, travel restrictions, enabling and relief measures, support
          for public health and clinical capacity) as well as more granular
          subcategory tagging (e.g., face coverings, quarantine, private sector
          closures, school closures, etc.)
        </li>
        <li>
          Authorizing role enacting the policy (e.g., governor, mayor, health
          official, president, city council, etc.)
        </li>
        <li>
          Start/end dates, including anticipated end dates for those policies
          still in effect but with declarative expirations
        </li>
        <li>
          Information about the geographic regions where the policy applies (if
          different from the level at which the policy was enacted)
        </li>
      </ul>
      <p>
        Researchers review public sources to identify policies, with the most
        common sources including government websites that collate policy
        announcements, either COVID-19-specific or more generally. If a
        documented policy is not available or where there are questions about
        the policy, researchers contact local public communications or other
        offices to confirm. A static copy (PDF or screen capture) of each policy
        is stored with links to any sites with associated policy announcements
        in the dataset.
      </p>
      <p>
        Legal experts review each policy following entry into the dataset to
        identify and code relevant authorities underlying the policy. This
        review is ongoing and data from the legal review are continually added
        to policies in the dataset. In addition, for policies in the US, this
        data collection includes capturing attributes of the US state with
        respect to how legal authority is allocated between the local and state
        government (see definitions for Dillon&rsquo;s Rule and Home Rule states
        in the data dictionary available from the AMP documentation page).
      </p>
      <p>
        Plans are recorded and coded using separate data given the nature of
        plans is different from that of policies and because plans, as included
        in AMP, do not have a requirement for being government-issued and or
        backed by legal authority or precedent. In addition to providing the pdf
        for the plan itself, data captured for plans includes (representative
        subset &ndash; see data dictionary for full description of data fields):
      </p>
      <ul>
        <li>Plan name a description</li>
        <li>Name and type of the organization that authored the plan</li>
        <li>
          Information about topics covered in the plan, based on the plan type
          (e.g., what aspects of school operations are addressed in a government
          plan; what aspects of operations are addressed in a private sector
          plan; etc.)
        </li>
        <li>
          Whether the plan was authored by an entity with authority to enact the
          plan elements
        </li>
      </ul>
      <h2>Policy Map</h2>
      <p>
        The policy map visualizes the policies in effect over time as well as a
        distancing level determined by analyzing policies in place on a given
        day (see below). A date slider at the top of the map page provides the
        ability to select a date or date range over which to compare the
        policies in effect in a given category, or view distancing level over
        time. State-level data are available for 50 US states and the District
        of Columbia (US only view) and currently includes country-level polices
        for select countries globally (sub-national polices are not included for
        locations other than the US). Expansion of coverage to additional
        countries is ongoing and are added to the map and policy library as
        policies are coded by the research team.
      </p>
      <h3>Visualizing distancing level, as analyzed from policies</h3>
      <p>
        Distancing level reflects major categories of status of the overall
        approach to COVID-19-related policies that address measures related to
        social distancing at a given time, including: Lockdown (Phase I),
        Stay-at-home (Phase II), Safer-at-home (Phase III), and New normal
        (Phase IV). Each phase is intended to reflect the approaches and phases
        that have emerged across the approach to COVID-19 response, including as
        aligned to the frameworks of the COVID Local Frontline Guide for Local
        Decision-Makers.
      </p>
      <p>
        The distancing status of each location is captured based on a day-by-day
        analysis of policies in effect for each state, over time, that address
        school closures, private sector closures, and mass gatherings. To
        determine distancing level, explicit policies are considered first and
        that status is used (e.g., stay-at-home policy for stay-at-home
        distancing level) so long as it addresses the defined combinations of
        school closures, private sector closures, and mass gathering
        restrictions listed for each distancing level below. In cases where an
        explicit policy is in place, but subsequent policies related to social
        distancing counteract key elements used in the definition of distancing
        level considered here, the distancing level is determined using the
        rules below. For example, a stay-at-home order that subsequently relaxes
        (lifts) private sector closures prior to the end of the stay-at-home
        order is considered in a safer-at-home status for the purposes of
        distancing level in COVID AMP. Finally, the rules also serve as the
        basis for determining distancing level when no explicit policy is in
        place, but policies addressing school closures, private sector closures,
        and mass gatherings exist. The definition for each distancing level is
        included and the bullets that follow reflect the conditions used to
        capture each status <em>via</em> and/or logic.
      </p>
      <p></p>
      <p>
        <strong>Lockdown (Phase I):&nbsp;</strong>Policies do not allow
        residents to leave their place of residence unless explicitly permitted
        to do so.&nbsp;
      </p>
      <ul>
        <li>
          Lockdown order in place (e.g., includes provisions requiring no
          movement outside or limits those leaving home for essential functions
          to specific household members or to only some days of the week)
        </li>
      </ul>
      <p>
        <strong>Stay-at-home (Phase II):</strong>&nbsp;Policies limit most
        in-person activities and social events
      </p>
      <p>
        For the purposes of determining distancing level in AMP, stay-at-home is
        defined by simultaneous closure of schools, private sector businesses,
        and restrictions on mass gatherings and events, as captured by the
        policy tagging completed by the research team. Stay-at-home distancing
        level is captured from one or more policies, as follows.
      </p>
      <ul>
        <li>
          Stay-at-home order that includes all of the following:
          <ul>
            <li>School closures</li>
            <li>Private sector closures</li>
            <li>Mass gathering and/or event restrictions</li>
          </ul>
        </li>
        <li>
          <u>OR</u> Combination of policies that includes all of the following:
          <ul>
            <li>School closure AND</li>
            <li>Private sector closures AND</li>
            <li>Mass gathering and/or event restrictions</li>
          </ul>
        </li>
      </ul>
      <p>
        <strong>Safer-at-home (Phase III):</strong>&nbsp;Policies limit
        activities to those specifically permitted, encouraging
        extra&nbsp;precautions and retaining limits on mass gatherings
      </p>
      <p>
        For the purposes of determining distancing level in AMP, safer-at-home
        is defined as continuing school closures, reopening of the private
        sector (either as specified in a safer-at-home order or through a
        combination of stay-at-home order plus relaxed private sector
        restrictions), and ongoing mass gathering restrictions (though they may
        be relaxed relative to stay-at-home conditions)
      </p>
      <ul>
        <li>Safer-at-home&nbsp;order in place</li>
      </ul>
      <ul>
        <li>
          <u>OR</u> Stay-at-home order in place with simultaneous policies that
          relax restrictions on (reopen) the private sector
        </li>
      </ul>
      <ul>
        <li>
          <u>OR</u> Combination of policies that includes all of the following:
          <ul>
            <li>School closure AND</li>
            <li>
              Private sector closure with some relaxation from prior, most
              restrictive policies AND
            </li>
            <li>
              Mass gathering and/or event restrictions with some relaxation from
              initial, most restrictive policies
            </li>
          </ul>
        </li>
      </ul>
      <p>
        <strong>New normal (Phase IV):</strong>&nbsp;A&nbsp;majority of public
        restrictions on mass gatherings and non-essential businesses are lifted
        or expired, with some encouraging of safeguards such as face coverings
      </p>
      <p>New normal distancing level is defined as:</p>
      <ul>
        <li>
          No stay-at-home or safer-at-home order in place (including by
          expiration)
        </li>
        <li>No private sector closures</li>
        <li>No mass gathering restrictions</li>
      </ul>
      <h3>Visualizing policies in place, by category, over time</h3>
      <p>
        To visualize policies in effect of different types over time, the map
        queries the policy dataset by date and location. Policies can be viewed
        by category on the map:
      </p>
      <ul>
        <li>Social distancing</li>
        <li>Emergency declarations</li>
        <li>Travel restrictions</li>
        <li>Enabling and relief measures</li>
        <li>Support for public health capacity</li>
      </ul>
      <p>
        Policies can be viewed by multi-selected categories or sub-categories to
        view the status of each location based on polices in effect/not in
        effect related specifically to private sector closures, school closures,
        mass gatherings, and others.
      </p>
      <h3>COVID caseload data</h3>
      <h4>US map and social distancing policy model</h4>
      <p>
        US state-level COVID-19 caseload data, new cases in the last 7 days and
        cumulative cases, are sourced from the New York Times Coronavirus
        (Covid-19) Data in the United States (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/nytimes/covid-19-data"
        >
          https://github.com/nytimes/covid-19-data
        </a>
        ). These data include confirmed cases and, where captured by public
        health agencies, probable cases. Data are updated daily. These data are
        collated by the New York Times on the basis of data from state and local
        health agencies and licensed under the Creative Commons Attribution-Non
        Commercial 4.0 International license.
      </p>
      <h4>Global map</h4>
      <p>
        Global COVID-19 caseload data, new cases in the last 7 days and
        cumulative cases, are sourced from the COVID-19 Data Repository by the
        Center for Systems Science and Engineering (CSSE) at Johns Hopkins
        University which holds the copyright to all data (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/CSSEGISandData/COVID-19"
        >
          https://github.com/CSSEGISandData/COVID-19
        </a>
        ). These data include only confirmed cases and are updated daily.
        Additional information about the collation of the data by the Johns
        Hopkins University is available from the GitHub repository linked above.
      </p>
      <h4>Social distancing policy model</h4>
      <p>
        The COVID AMP policy model supports users in evaluating the impact of
        policies on the outbreak &ndash; a visualization of when (1) policies
        were implemented in each state relative to their actual caseload and
        fatalities, (2) predictive analysis for how future policy implementation
        will impact caseload, and (3) an analysis of what would have been had no
        mitigation policies been implemented. The social distancing policy model
        includes actual and modeled data for COVID-19 cases, COVID-related
        hospitalizations, ICU patient count (specifically for COVID
        complications), and deaths at daily resolution. These data about the
        dynamics of COVID outbreaks are accompanied by key designations of
        policies related to social distancing (i.e., stay-at-home,
        safer-at-home, new normal) captured from policies in place at different
        points in the outbreak (see &ldquo;Visualizing distancing level,&rdquo;
        above). For points in the future, users can add new social distancing
        policies and evaluate their relative impact on the modeled outcome. The
        AMP social distancing policy model is currently available for US states
        at state scale.
      </p>
      <p>
        For past dates, cases are sourced from confirmed and probable cases (see
        &lsquo;COVID caseload data&rsquo; above) data from March 1 to the most
        recent data update. Because case data is cumulative, we calculate
        &ldquo;active&rdquo; cases by assuming patients recover 13 days after
        their case is confirmed by testing and deriving deaths from those cases.
        We assume approximately 25% of total confirmed cases are hospitalized
        with equates to ~7% of total cases (symptomatic and asymptomatic.) For
        all dates past the most recent case update, all data for cases,
        hospitalizations, ICU patient counts, and deaths are modeled using the
        approach below as seeded with the current case counts from reported
        actual cases (from the New York Times Coronavirus (Covid-19) Data in the
        United States, as described above).
      </p>
      <p>
        Future cases, hospitalizations, ICU patient counts, and deaths are
        predicted on the basis of a modified SEIR (susceptible, exposed,
        infectious, recovered) model adding multiple levels of infections and an
        asymptomatic class (see Figure 1 below). The COVID-19 SEIR model used
        here was developed in collaboration with{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://covidactnow.org/resources#model"
        >
          COVID Act Now
        </a>
        , originally adapted from the original{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://alhill.shinyapps.io/COVID19seir/"
        >
          work of Dr. Allison Hill
        </a>
        <a data-type="ref" id="_ednref1" onClick={onClick}>
          i
        </a>
        , Research Fellow at the Harvard Program on Evolutionary Dynamics. In
        this model, susceptible (S) individuals may become exposed (E) to the
        virus, then infected (I) at varying levels of disease severity
        (asymptomatic, mild, moderate, or severe, captured as rates A, I
        <sub>1</sub>, I<sub>2</sub>, and I<sub>3</sub> respectively. Infected
        individuals then either recover (R) or die (D). Figure 1, below, is
        adapted from Hill <em>et al</em>., and describes the process underling
        the COVID-19 SEIR model that calculated cases, hospitalizations, ICU
        patient count, and deaths in the social distancing policy model.
      </p>
      <img src={modelPng} />
      <p className={styles.figureCaption}>
        Figure 1: State diagram depicting the transitions between states
        included in the model and variables corresponding to the rate of each
        transition. Parameter values are included and described below.
      </p>
      <h4>State descriptions</h4>
      <p>
        The following bullets summarize the states of the SEIR model and how
        individuals progress through them (see tables below for details on each
        parameter):
      </p>
      <ul>
        <li>
          <strong>Susceptible</strong>: Starting state for all individuals in a
          fully predictive run and, in cases where the model run is initiated
          base on prior cases, the susceptible group includes the proportion of
          individuals not previously sick.
        </li>
        <li>
          <strong>Exposed</strong>: People move from Susceptible to Exposed when
          they come in contact with other infectious individuals with a rate
          that is determined by the number of contacts individuals have with one
          another (providing basis for susceptible individuals to come into
          contact with infected individuals and get exposed). In this model,
          Exposed individuals are not yet infectious to other and do not have
          symptoms (pre-symptomatic). All exposed individuals transition to mild
          cases (Infected<sub>1</sub>) after 6 days.
        </li>
        <li>
          <strong>Asymptomatic</strong>: These cases have no symptoms and will
          not know they are infected unless tested. They can, however, infect
          other people. We assume 30% of infected people in the model are
          asymptomatic and infected for a total of 12 days with the final 6 of
          those being infectious to others.
        </li>
        <li>
          <strong>
            Infected<sub>1</sub>
          </strong>
          : These are mild cases. After approximately a week, 7% of these cases
          worsen, and require hospitalization (the Infected<sub>2</sub> state),
          and the remaining 93% progress to the Recovered state.
        </li>
        <li>
          <strong>
            Infected<sub>2</sub>
          </strong>
          : These are severe, hospitalized cases, requiring non-ICU treatment.
          After approximately a week, 13% of these cases worsen, thus requiring
          ICU/ventilation (Infected<sub>3</sub>), while the remaining 87%
          progress to the Recovered state.
        </li>
        <li>
          <strong>
            Infected<sub>3</sub>
          </strong>
          : These are critical cases requiring ICU treatment. This model assumes
          all deaths must first pass through this category. After approximately
          a week, 40% of these cases lead to death, while the remaining 60%
          progress to Recovered.
        </li>
        <li>
          <strong>Recovered</strong>: Includes all individuals who have already
          had the disease (excluding those who died). For the purposes of the
          model, recovered individuals are considered to be immune from future
          infection.
        </li>
        <li>
          <strong>Dead</strong>: Those that have died from the disease. All of
          these come from ICU cases and make up approximately 1% of all cases.
        </li>
      </ul>
      <p></p>
      <h4>Modeling disease characteristics</h4>
      <p>
        Values for the epidemiological model parameters are based on the best
        available data and academic consensus, wherever possible. Changes in
        parameters related to policy implementation are based on the expected
        changes in contact rate and transmission anticipated corresponding to
        policy status under each category of social distancing (lockdown,
        stay-at-home, safer-at-home, and new normal; see above for definitions).
        These estimates are calculated as a difference in contact rate and
        transmission based on reproductive rate (<em>R</em>), the number of new
        cases that result from one individual infecting others. Reproductive
        rate is an inferred model outcome and is not an input of the SEIR model,
        but is used to calibrate the model state to produce a transmission rate
        (&beta;) for the given conditions in the table below.
      </p>
      <p>
        The probability of transmission (&beta;), representing the likelihood
        that a susceptible individual is exposed to someone who is infectious
        (and the likelihood of infection given exposure, which is not adjusted
        directly in the model), is set dynamically based on the policies in
        place at a given time. Thus, the distancing level captured from policies
        is considered in the transmission dynamics for future COVID spread
        (e.g., stay-at-home more stringently restricts contacts between
        individuals and suppresses transmission more than a safer-at-home
        condition).
      </p>
      <h4>What if we had done nothing? (Counterfactual)</h4>
      <p>
        As the outbreak has unfolded, we have added a counterfactual analysis to
        assess how the event would have unfolded had states not implemented any
        policies. The counterfactual scenario is modeled assuming contact rate
        remained elevated throughout the Spring and early Summer of 2020, as
        those states had not implemented social distancing policies. We
        initialize the model on the first day each state hit 100 cumulative
        cases. We then project forward assuming using a R value of 2.1, slightly
        lower than that before the event to account for changes in behavior as
        would be expected with only reports of disease threat (as seen in states
        without social distancing policies, but that still showed a reduction in
        mobility.) In those states who experienced large, early outbreaks,
        defined by more than 1,000 cumulative cases before May 15th, (New Jersey
        and New York) we initialize the counterfactual at the end of these
        outbreaks to better predict the effect of policies for the next wave. In
        addition to plotting the counterfactual against the actuals (“What if we
        had done nothing?”, we present the difference in current actual caseload
        against the modelled caseload and the modelled number of deaths at the
        upper right of the chart. Note that the caseload compares today against
        the “What if” scenario today; for deaths, this value is adjusted to
        account for modelled fatalities expected to result from the modelled
        number of cases. (We report the modelled deaths as those 30 days in the
        future to captured the average 30 day lag from start of infection to
        death.)
        {/* These two endnotes don't appear in the document anymore */}
        {/* <a data-type="ref" id="_ednref2" onClick={onClick}> */}
        {/*   ii */}
        {/* </a> */}
        {/* <a data-type="ref" id="_ednref3" onClick={onClick}> */}
        {/*   iii */}
        {/* </a>{" "} */}
      </p>
      <table>
        <tbody>
          <tr>
            <td colspan="4">
              <p>
                <strong>R-values by distancing level</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p>
                <strong>Distancing level (phase)</strong>
              </p>
            </td>
            <td>
              <p>
                <strong>Effective R value </strong>
              </p>
            </td>
            <td>
              <p>
                <strong>
                  Corresponding Beta value
                  <a data-type="ref" id="_ednref4" onClick={onClick}>
                    <strong>ii</strong>
                  </a>
                </strong>
              </p>
            </td>
            <td>
              <p>
                <strong>Percentage reduction (relative to early event)</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p>Early event (prior to any policy interventions)</p>
            </td>
            <td>
              <p>2.47</p>
            </td>
            <td>
              <p>.04</p>
            </td>
            <td>
              <p>N/A</p>
            </td>
          </tr>
          <tr>
            <td>
              <p>Lockdown (Phase I)</p>
            </td>
            <td>
              <p>0.79</p>
            </td>
            <td>
              <p>.012</p>
            </td>
            <td>
              <p>68%</p>
            </td>
          </tr>
          <tr>
            <td>
              <p>Stay-at-home (Phase II)</p>
            </td>
            <td>
              <p>0.90</p>
            </td>
            <td>
              <p>0.14</p>
            </td>
            <td>
              <p>64%</p>
            </td>
          </tr>
          <tr>
            <td>
              <p>Safer-at-home (Phase III)</p>
            </td>
            <td>
              <p>1.21</p>
            </td>
            <td>
              <p>0.19</p>
            </td>
            <td>
              <p>49%</p>
            </td>
          </tr>
          <tr>
            <td>
              <p>New normal (Phase IV)</p>
            </td>
            <td>
              <p>1.78</p>
            </td>
            <td>
              <p>0.29</p>
            </td>
            <td>
              <p>28%</p>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        The following parameters are drawn from the best available clinical
        information for COVID-19, and effects of non-pharmaceutical
        interventions manifested through policies, in order to populate the
        model.
      </p>
      <table>
        <tbody>
          <tr>
            <td colspan="3">
              <p>
                <strong>Model Parameters</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p>Parameter</p>
            </td>
            <td>
              <p>Description, as used in model</p>
            </td>
            <td>
              <p>Value(s)</p>
            </td>
          </tr>
          <tr>
            <td>
              <p>Transmission rate (non-hospitalized)</p>
            </td>
            <td>
              <p>
                Rate at which susceptible individuals are infected, which is
                dependent upon distancing level resulting from policies in place
              </p>
            </td>
            <td>
              <p>Based on distancing level:</p>
              <ul>
                <li>Prior to any policy interventions = 0.4</li>
                <li>Lockdown = 0.12</li>
                <li>Stay-at-home = 0.1375</li>
                <li>Safer-at-home = 0.19</li>
                <li>New open = 0.285</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td>
              <p>Transmission rate (hospitalized, ICU)</p>
            </td>
            <td>
              <p>
                Rate at which susceptible individuals are infected by patients
                in the hospital setting, which is independent of distancing
                level resulting from policies
              </p>
            </td>
            <td>
              <p>0.1</p>
            </td>
          </tr>
          <tr>
            <td>
              <p>Pre-symptomatic period</p>
            </td>
            <td>
              <p>
                3-day pre-symptomatic period used to calculate alpha (ɑ =
                1/pre-symptomatic period)
              </p>
            </td>
            <td>
              <p>
                6 days
                <a data-type="ref" id="_ednref5" onClick={onClick}>
                  iii
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p>Duration of mild infections</p>
            </td>
            <td>
              <p>
                6-day mild infection period sets the rate at which cases move
                from mildly infected to either severely infected (7%) or
                recovered (93%) (g<sub>1</sub> = 1/mild infection period)
              </p>
            </td>
            <td>
              <p>
                6 days
                <a data-type="ref" id="_ednref6" onClick={onClick}>
                  iv
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p>% infections requiring hospitalization</p>
            </td>
            <td>
              <p>
                Proportion of mild infections that progress to severe infections
              </p>
            </td>
            <td>
              <p>
                7.27%
                <a data-type="ref" id="_ednref7" onClick={onClick}>
                  v
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p>Duration of hospitalization, pre-ICU admittance</p>
            </td>
            <td>
              <p>
                11-day period sets the rate at which cases move hospitalized to
                either ICU (~14%) or recovered (~85%%) (g<sub>2</sub> =
                1/pre-ICU admittance period)
              </p>
            </td>
            <td>
              <p>
                11 days
                <a data-type="ref" id="_ednref8" onClick={onClick}>
                  vi
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p>% hospitalizations requiring ICU care</p>
            </td>
            <td>
              <p>
                Proportion of severe infections that progress to ICU admission
              </p>
            </td>
            <td>
              <p>
                22%
                <a data-type="ref" id="_ednref9" onClick={onClick}>
                  vii
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p>Case fatality rate (CFR)</p>
            </td>
            <td>
              <p>Fraction of all cases resulting in death</p>
            </td>
            <td>
              <p>
                1.09%
                <a data-type="ref" id="_ednref10" onClick={onClick}>
                  viii
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p>Time in ICU until death</p>
            </td>
            <td>
              <p>
                Time a patient spends in the ICU setting before death or
                recovering
              </p>
            </td>
            <td>
              <p>
                8 days
                <a data-type="ref" id="_ednref11" onClick={onClick}>
                  ix
                </a>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      <h3>Policies (distancing level)</h3>
      <p>
        The AMP Policy Model includes policies implemented historically, as
        captured by the &lsquo;Distancing level&rsquo;, and allows users to add
        policies in the future. Future policy interventions update model
        parameters (specifically the transmission level, or Beta) to reflect the
        increase or decrease in intra-personal contact level as a result of
        policies that change the level of social distancing. This feature
        provides the ability to analyze relative, future impact of policy
        implementation on caseload.
      </p>
      <hr />
      <section className={styles.endnotes}>
        <p>
          <a data-type="endnote" onClick={onClick} id="_edn1">
            i
          </a>{" "}
          <p>
            Hill, Alison, et al. "Modeling COVID-19 Spread vs Healthcare
            Capacity"{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://alhill.shinyapps.io/COVID19seir/"
            >
              https://alhill.shinyapps.io/COVID19seir/
            </a>
          </p>
        </p>
        {/* <p> */}
        {/*   <a data-type="endnote" onClick={onClick} id="_edn2"> */}
        {/*     ii */}
        {/*   </a>{" "} */}
        {/*   <p> */}
        {/*     <a */}
        {/*       target="_blank" */}
        {/*       rel="noopener noreferrer" */}
        {/*       href="https://www.apple.com/covid19/mobility" */}
        {/*     > */}
        {/*       https://www.apple.com/covid19/mobility */}
        {/*     </a> */}
        {/*   </p> */}
        {/* </p> */}
        {/* <p> */}
        {/*   <a data-type="endnote" onClick={onClick} id="_edn3"> */}
        {/*     iii */}
        {/*   </a>{" "} */}
        {/*   <p> */}
        {/*     <a */}
        {/*       target="_blank" */}
        {/*       rel="noopener noreferrer" */}
        {/*       href="https://visualization.covid19mobility.org/?date=2020-07-09&amp;dates=2020-04-09_2020-07-09&amp;region=WORLD" */}
        {/*     > */}
        {/*       https://visualization.covid19mobility.org/?date=2020-07-09&amp;dates=2020-04-09_2020-07-09&amp;region=WORLD */}
        {/*     </a> */}
        {/*   </p> */}
        {/* </p> */}
        <p>
          <a data-type="endnote" onClick={onClick} id="_edn4">
            ii
          </a>{" "}
          <p>
            Calculated based on a consideration of literature-reported R values,
            estimated reduction of transmission by non-pharmaceutical
            interventions, and bounded by estimated effective R values developed
            by the R<sub>t</sub> COVID-19 project (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://rt.live/"
            >
              https://rt.live/
            </a>
            ).
          </p>
        </p>
        <p>
          <a data-type="endnote" onClick={onClick} id="_edn5">
            iii
          </a>{" "}
          <p>
            Wei, Yongyue, et al. &ldquo;A systematic review and meta-analysis
            reveals long and dispersive incubation period of COVID-19&rdquo;{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.medrxiv.org/content/10.1101/2020.06.20.20134387v1"
            >
              https://www.medrxiv.org/content/10.1101/2020.06.20.20134387v1
            </a>
          </p>
        </p>
        <p>
          <a data-type="endnote" onClick={onClick} id="_edn6">
            iv
          </a>{" "}
          <p>
            Koehler, Matt, et al. &ldquo;Modeling COVID-19 for lifting
            non-pharmaceutical interventions&rdquo;{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.medrxiv.org/content/10.1101/2020.07.02.20145052v1"
            >
              https://www.medrxiv.org/content/10.1101/2020.07.02.20145052v1
            </a>
          </p>
        </p>
        <p>
          <a data-type="endnote" onClick={onClick} id="_edn7">
            v
          </a>{" "}
          <p>
            Ferguson, Neil, et al. "Report 9: Impact of non-pharmaceutical
            interventions (NPIs) to reduce COVID19 mortality and healthcare
            demand"{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.imperial.ac.uk/media/imperial-college/medicine/sph/ide/gida-fellowships/Imperial-College-COVID19-NPI-modelling-16-03-2020.pdf"
            >
              https://www.imperial.ac.uk/media/imperial-college/medicine/sph/ide/gida-fellowships/Imperial-College-COVID19-NPI-modelling-16-03-2020.pdf
            </a>
            . Note: As implemented in the model, the reported values in this
            reference are weighted by US population demographics.
          </p>
        </p>
        <p>
          <a data-type="endnote" onClick={onClick} id="_edn8">
            vi
          </a>{" "}
          <p>
            US Centers for Disease Control and Prevention. &ldquo;Interim
            Clinical Guidance for Management of Patients with Confirmed
            Coronavirus Disease (COVID-19)&rdquo;{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.cdc.gov/coronavirus/2019-ncov/hcp/clinical-guidance-management-patients.html"
            >
              https://www.cdc.gov/coronavirus/2019-ncov/hcp/clinical-guidance-management-patients.html
            </a>
          </p>
        </p>
        <p>
          <a data-type="endnote" onClick={onClick} id="_edn9">
            vii
          </a>{" "}
          <p>
            Cummings, Matthew, et al. "Epidemiology, clinical course, and
            outcomes of critically ill adults with COVID-19 in New York City: a
            prospective cohort study"{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(20)31189-2/fulltext"
            >
              https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(20)31189-2/fulltext
            </a>
          </p>
        </p>
        <p>
          <a data-type="endnote" onClick={onClick} id="_edn10">
            viii
          </a>{" "}
          <p>
            Ferguson, Neil, et al. "Report 9: Impact of non-pharmaceutical
            interventions (NPIs) to reduce COVID19 mortality and healthcare
            demand"{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.imperial.ac.uk/media/imperial-college/medicine/sph/ide/gida-fellowships/Imperial-College-COVID19-NPI-modelling-16-03-2020.pdf"
            >
              https://www.imperial.ac.uk/media/imperial-college/medicine/sph/ide/gida-fellowships/Imperial-College-COVID19-NPI-modelling-16-03-2020.pdf
            </a>
            . Note: As implemented in the model, the reported values in this
            reference are weighted by US population demographics.
          </p>
        </p>
        <p>
          <a data-type="endnote" onClick={onClick} id="_edn11">
            ix
          </a>{" "}
          <p>
            European Centre for Disease Prevention and Control. &ldquo;Clinical
            characteristics of COVID-19&rdquo;{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.ecdc.europa.eu/en/covid-19/latest-evidence/clinical"
            >
              https://www.ecdc.europa.eu/en/covid-19/latest-evidence/clinical
            </a>
          </p>
        </p>
      </section>
    </div>
  );
};

export default Documentation;
