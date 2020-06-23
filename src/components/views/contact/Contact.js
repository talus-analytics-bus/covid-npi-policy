import React, { useState, useEffect } from "react";
import classNames from "classnames";
import styles from "./contact.module.scss";
import axios from "axios";

const Contact = ({ setPage, setLoading }) => {
  // State
  const [submitButtonText, setSubmitButtonText] = useState("Submit");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const handleSubmit = event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));

    const hasEmptyFields = Object.values(data).some(field => field === "");
    if (hasEmptyFields) {
      setErrorMessage(
        <div className={styles.error}>
          Some required fields below are not filled in, please complete before
          submitting.
        </div>
      );
      return;
    } else {
      setSubmitButtonText("Submitting...");

      // perform field validation as necessary, provide user feedback if invalid
      // set the email subject if the form does not ask the user for it
      data["subject"] = "New message from COVID AMP contact form";
      // set the site, this needs to match the sites listed in the 'sites' variable
      data["site"] = "covid-amp";
      // submit to api
      axios
        .post(
          "https://p0hkpngww3.execute-api.us-east-1.amazonaws.com/submit",
          JSON.stringify(data),
          { headers: { "Content-Type": "application/json" } }
        )
        .then(() => {
          setSubmitButtonText("Submit");
          setSuccessMessage(
            <div className={styles.success}>Feedback submitted</div>
          );
          setErrorMessage(null);
        })
        .catch(error =>
          // show error
          {
            console.log(error);
            setErrorMessage(
              "There was an error submitting your request, please check your network connection and try again."
            );
          }
        );
    }
  };

  // set page on init
  useEffect(() => {
    setLoading(false);
    setPage("contact");
  }, []);

  const fields = [
    [
      {
        id: "First_Name",
        label: "First name",
        required: true,
        type: "text",
        tag: "input"
      },
      {
        id: "Last_Name",
        label: "Last name",
        required: true,
        type: "text",
        tag: "input"
      }
    ],
    [
      {
        id: "Email",
        label: "Email",
        required: true,
        type: "email",
        tag: "input"
      },
      {
        id: "Organization_Name",
        label: "Organization name",
        required: true,
        type: "text",
        tag: "input"
      }
    ]
  ];

  const options = [
    "Policy-related request",
    "Feedback",
    "Help accessing data",
    "General"
  ];

  return (
    <div className={styles.contact}>
      <h2 className={styles.title}>Contact us</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formRow}>{errorMessage}</div>
        <div className={styles.fields}>
          {fields.map(group => (
            <div className={styles.group}>
              {group.map(d => (
                <label htmlFor={d.id}>
                  {d.label}
                  {d.required && "*"}
                  {d.tag === "input" && (
                    <input type={d.type} id={d.id} name={d.id} />
                  )}
                  {d.tag === "textarea" && (
                    <textarea
                      type={d.type}
                      id={d.id}
                      name={d.id}
                      maxLength={d.maxLength || "1200"}
                    />
                  )}
                </label>
              ))}
            </div>
          ))}

          <div className={styles.message}>
            <label htmlFor={"topic"}>
              Topic
              <select id={"topic"} name={"topic"}>
                {options.map(d => (
                  <option value={d}>{d}</option>
                ))}
              </select>
            </label>
            <label htmlFor={"body"}>
              Comment or question*
              <textarea
                type={"text"}
                id={"body"}
                name={"body"}
                maxLength={"500"}
              />
              <div className={styles.footer}>
                <p>500 characters</p>
                <button>{submitButtonText}</button>
              </div>
            </label>
          </div>
        </div>
        <div className={styles.formRow}>{successMessage}</div>
      </form>
    </div>
  );
};

export default Contact;
