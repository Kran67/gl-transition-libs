//@flow
import React, { Component } from "react";
import querystring from "querystring";
import URL from "url";
import Editor from "./Editor";
import transform from "./transform";
import SuggestTransform from "./SuggestTransform";
import { githubRepoFolder, githubRepoPath } from "./conf";
import { transitionsByName } from "./data";
import PrimaryBtn from "./PrimaryBtn";
import { FaGithub } from "react-icons/fa";
import "./EditNew.css";

function selectEventTarget(e: *) {
  e.target.select();
}

const reservedVariablesOfOldTransition = ["main", "from", "to", "progress"];
function probablyOldTransitionCode({ errors }: *) {
  return (
    errors.filter(
      e =>
        e.code === "GLT_reserved_variable_used" &&
        e.id &&
        reservedVariablesOfOldTransition.includes(e.id)
    ).length === reservedVariablesOfOldTransition.length
  );
}

const transformWithoutNameCollision = (filename, glsl) =>
  transform(filename, glsl, ({ data: { name } }) => {
    const errors = [];
    if (name in transitionsByName) {
      errors.push({
        type: "warn",
        code: "GLT_invalid_filename",
        message: "Transition '" + name + "' already exists"
      });
    }
    return errors;
  });

const defaultsQuery = {
  name: "",
  glsl: `\
// Author:
// License: MIT

vec4 transition (vec2 uv) {
  return mix(
    getFromColor(uv),
    getToColor(uv),
    progress
  );
}`
};

type Props = {
  location: *,
  history: *
};

type Query = {
  glsl?: string,
  name?: string
};

function getQuery({ location }: Props): Query {
  return !location.search ? {} : querystring.parse(location.search.slice(1));
}
function setQuery(props: Props, query: Query): void {
  const cur = getQuery(props);
  props.history.replace({
    pathname: props.location.pathname,
    search: querystring.stringify({ ...cur, ...query })
  });
}

export default class EditNew extends Component {
  props: Props;
  state: {
    transitionResult: *,
    transitionParams: *,
    transformSuggestionDiscarded: boolean
  };

  constructor(props: Props) {
    super();
    const { name, glsl } = { ...defaultsQuery, ...getQuery(props) };
    const transitionResult = transformWithoutNameCollision(
      name + ".glsl",
      glsl
    );
    const transitionParams = {};
    this.state = {
      transitionResult,
      transitionParams,
      transformSuggestionDiscarded: false
    };
  }

  componentWillReceiveProps(props: *) {
    const currentTransition = this.state.transitionResult.data.transition;
    const { glsl, name } = { ...currentTransition, ...getQuery(props) };
    if (glsl !== currentTransition.glsl || name !== currentTransition.name) {
      const transitionResult = transformWithoutNameCollision(
        name + ".glsl",
        glsl
      );
      this.setState({ transitionResult });
    }
  }

  onTransitionParamsChange = (transitionParams: *) => {
    this.setState({ transitionParams });
  };

  onFragChange = (glsl: string) => {
    setQuery(this.props, { glsl });
  };

  onFileNameChange = ({ target: { value: name } }: *) => {
    setQuery(this.props, { name });
  };

  onDiscard = () => {
    this.setState({ transformSuggestionDiscarded: true });
  };

  render() {
    const {
      transitionResult,
      transitionParams,
      transformSuggestionDiscarded
    } = this.state;
    const filenameErrors = [];
    const glslErrors = [];
    transitionResult.errors.forEach(e => {
      if (e.code === "GLT_invalid_filename") {
        filenameErrors.push(e);
      } else {
        glslErrors.push(e);
      }
    });
    const { name, glsl } = transitionResult.data.transition;
    return (
      <Editor
        errors={glslErrors}
        transition={transitionResult.data.transition}
        compilation={transitionResult.data.compilation}
        onFragChange={this.onFragChange}
        transitionParams={transitionParams}
        onTransitionParamsChange={this.onTransitionParamsChange}
        asideHead={
          <div>
            <label className="tname">
              <input
                className={`transition-name ${
                  filenameErrors.length > 0 ? "error" : ""
                }`}
                type="text"
                placeholder="Transition Name"
                onFocus={selectEventTarget}
                value={name}
                onChange={this.onFileNameChange}
                maxLength={40}
              />
              <span className="transition-name-extension">.glsl</span>
            </label>
            {filenameErrors.map((e, i) => (
              <div key={i} className="filename-error">
                {e.message}
              </div>
            ))}
          </div>
        }
        actionBtn={
          <PrimaryBtn
            disabled={transitionResult.errors.length > 0}
            href={URL.format({
              pathname:
                "https://github.com/" +
                githubRepoPath +
                "/new/master" +
                githubRepoFolder +
                "/" +
                name +
                ".glsl",
              query: {
                filename: name + ".glsl",
                value: transitionResult.data.transition.glsl
              }
            })}
          >
            <FaGithub /> Publish on Github
          </PrimaryBtn>
        }
      >
        {!transformSuggestionDiscarded &&
        probablyOldTransitionCode(transitionResult) ? (
          <SuggestTransform
            glsl={glsl}
            onFragChange={this.onFragChange}
            onDiscard={this.onDiscard}
          />
        ) : null}
      </Editor>
    );
  }
}
