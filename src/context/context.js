import React, { useState, useEffect } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";

const GithubContext = React.createContext();

//Provider, Consumer - GithubContext.Provider

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);

  //request loading
  const [request, setRequest] = useState(0);
  const [loading, setLoading] = useState(false);

  //check error
  const [error, setError] = useState({ show: false, msg: "" });

  //search github user
  const searchGithubUser = async (user) => {
    toggleError();
    setLoading(true);
    const response = await axios(`${rootUrl}/users/${user}`).catch((err) =>
      console.log(err)
    );
    console.log(response);
    if (response) {
      setGithubUser(response.data);
      console.log(response.data);

      //repo url:  https://api.github.com/users/john-smilga/repos?per_page=100
      //follower url https://api.github.com/users/john-smilga/followers
      const { login, followers_url } = response.data;
      axios(`${rootUrl}/users/${login}/repos?per_Page=100`).then((response) =>
        setRepos(response.data)
      );
      axios(followers_url).then((response) => setFollowers(response.data));
    } else {
      toggleError(true, "no user found");
    }
    checkRequest();
    setLoading(false);
  };

  //check request rate
  const checkRequest = () => {
    axios(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        let {
          rate: { remaining },
        } = data;
        setRequest(remaining);

        if (remaining === 0) {
          toggleError(true, "no more request");
        }
      })
      .catch((err) => console.log(err));
  };

  const toggleError = (show = false, msg = "") => {
    setError({ show, msg });
  };

  useEffect(checkRequest, []);

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        request,
        error,
        searchGithubUser,
        loading,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubProvider, GithubContext };
