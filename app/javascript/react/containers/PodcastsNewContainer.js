import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Redirect } from "react-router-dom";
import _ from "lodash";

import ErrorList from "../components/ErrorList.js";

const PodcastsNewContainer = (props) => {
  const fields = ["name", "url"];
  const [podcastRecord, setPodcastRecord] = useState({
    name: "",
    url: "",
  });
  const [newRecord, setNewRecord] = useState({});
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    setPodcastRecord({
      ...podcastRecord,
      [event.currentTarget.id]: event.currentTarget.value,
    });
  };

  const validForSubmission = () => {
    let submitErrors = {};

    for (const field of fields) {
      if (podcastRecord[field].trim() === "") {
        submitErrors = {
          ...submitErrors,
          [field]: `${field} is blank`,
        };
      }
    }

    if (
      !podcastRecord["url"].includes("http://") &&
      !podcastRecord["url"].includes("https://")
    ) {
      submitErrors = {
        ...submitErrors,
        [url]: "url must include full HTTP address",
      };
    }
    setErrors(submitErrors);
    return _.isEmpty(submitErrors);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (validForSubmission()) {
      let formPayload = {
        podcast: podcastRecord,
      };
      fetch("/api/v1/podcasts", {
        credentials: "same-origin",
        method: "POST",
        body: JSON.stringify(formPayload),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            return response;
          } else {
            response.json().then((body) => setErrors(body.error));
            let errorMessage = `${response.status} (${response.statusText})`;
            let error = new Error(errorMessage);
            throw error;
          }
        })
        .then((response) => response.json())
        .then((body) => {
          let newPodcast = body.podcast;
          setNewRecord(newPodcast);
          setShouldRedirect(true);
        })
        .catch((error) => console.error(`Error in fetch: ${error.message}`));
    }
  };

  if (shouldRedirect) {
    return <Redirect to={`/podcasts/${newRecord.id}`} />;
  }

  return (
    <div>
      <ErrorList errors={errors} />
      <div className="callout">
        <h4 className="center">Add a Podcast</h4>
        <form className="new-podcast" onSubmit={onSubmit}>
          <label>
            Name:
            <input
              type="text"
              id="name"
              onChange={handleChange}
              value={podcastRecord.name}
            />
          </label>

          <label>
            URL:
            <input
              type="text"
              id="url"
              onChange={handleChange}
              value={podcastRecord.url}
            />
          </label>

          <input className="button center" type="submit" value="Submit" />
        </form>
      </div>
      <Link to="/" className="button center">All Podcasts</Link>
    </div>
  );
};

export default PodcastsNewContainer;
