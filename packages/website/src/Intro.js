import React, { PureComponent, Component } from "react";
import { Link } from "react-router-dom";
import BezierEasing from "bezier-easing";
import BezierEasingEditor from "bezier-easing-editor";
import AnimatedVignette from "./AnimatedVignette";
import { Waypoint } from "react-waypoint";
import { transitionsOrderByRandom, transitionsByName } from "./data";
import { githubRepoPath } from "./conf";
import GlslCode from "./GlslCode";
import TransitionAuthorAndName from "./TransitionAuthorAndName";
import { defaultSampler2D } from "./transform";
import { fromImage, toImage } from "./Gallery";
import { FaGithub } from "react-icons/fa";
import "./Intro.css";
import cut1mp4 from "./videos/sintel/cut1.mp4";
import cut2mp4 from "./videos/sintel/cut2.mp4";
import cut3mp4 from "./videos/sintel/cut3.mp4";
import cut1webm from "./videos/sintel/cut1.webm";
import cut2webm from "./videos/sintel/cut2.webm";
import cut3webm from "./videos/sintel/cut3.webm";
const images = [
  require("./images/1024x768/a1mV1egnQwOqxZZZvhVo_street.jpg"),
  require("./images/1024x768/barley.jpg"),
  require("./images/1024x768/bigbuckbunny_snapshot1.jpg"),
  require("./images/1024x768/hBd6EPoQT2C8VQYv65ys_White_Sands.jpg"),
  require("./images/1024x768/ic1dX3kBQjGNaPQb8Xel_1920x1280.jpg"),
  require("./images/1024x768/ikZyw45kT4m16vHkHe7u_9647713235_29ce0305d2_o.jpg"),
  require("./images/1024x768/lUUnN7VGSoWZ3noefeH7_Baker_Beach-12.jpg"),
  require("./images/1024x768/pHyYeNZMRFOIRpYeW7X3_manacloseup.jpg"),
  require("./images/1024x768/wdXqHcTwSTmLuKOGz92L_Landscape.jpg")
];

const allImagesToPreload = images.concat([
  defaultSampler2D,
  fromImage,
  toImage
]);

const Logo = () => (
  <span className="logo">
    <span>GL</span>
    <span>Transitions</span>
  </span>
);

class VignetteFooter extends PureComponent {
  props: {
    transition: *
  };
  render() {
    const { transition } = this.props;
    return (
      <Link to={`/editor/${transition.name}`}>
        <footer>
          <TransitionAuthorAndName transition={transition} />
        </footer>
      </Link>
    );
  }
}

class BezierEasingEditorWithProgressSetter extends Component {
  state = {
    progress: 0
  };
  setProgress(progress: number) {
    this.setState({ progress });
  }
  render() {
    return (
      <BezierEasingEditor {...this.props} progress={this.state.progress} />
    );
  }
}

class TrackVisibility extends Component {
  props: {
    children?: Function
  };
  state = {
    visible: false
  };
  onEnter = () => {
    this.setState({ visible: true });
  };
  onLeave = () => {
    this.setState({ visible: false });
  };
  render() {
    const { children } = this.props;
    const { visible } = this.state;
    return (
      <Waypoint onEnter={this.onEnter} onLeave={this.onLeave}>
        {children(visible)}
      </Waypoint>
    );
  }
}

class Preview extends PureComponent {
  render() {
    const { width, height } = this.props;
    return (
      <TrackVisibility>
        {visible => (
          <div className="preview">
            <AnimatedVignette
              paused={!visible}
              transitions={transitionsOrderByRandom}
              images={images}
              width={width}
              height={height}
              duration={3000}
              delay={500}
              interaction={false}
              Footer={VignetteFooter}
            />
          </div>
        )}
      </TrackVisibility>
    );
  }
}

class ConfigurableExample extends PureComponent {
  props: {
    width: number,
    height: number
  };
  state = {
    easing: [0.5, 0, 0.8, 0.8],
    duration: 2000,
    delay: 100,
    transitionParams: {
      reflection: 0.4,
      perspective: 0.4,
      depth: 3
    }
  };
  onEasingChange = easing => {
    this.setState({ easing });
  };
  onDurationChange = e => {
    this.setState({ duration: parseInt(e.target.value, 10) });
  };
  onDelayChange = e => {
    this.setState({ delay: parseInt(e.target.value, 10) });
  };
  onTransitionParamsChange = e => {
    this.setState({
      transitionParams: {
        ...this.state.transitionParams,
        [e.target.name]: parseFloat(e.target.value, 10)
      }
    });
  };
  onBezierEditorRef = ref => {
    this.bezierEditor = ref;
  };
  onDrawWithProgress = progress => {
    const { bezierEditor } = this;
    if (!bezierEditor) return;
    bezierEditor.setProgress(progress);
  };
  render() {
    const { width, height } = this.props;
    const { easing, duration, delay, transitionParams } = this.state;
    const bezierEasingSize = Math.round(0.6 * width);
    return (
      <TrackVisibility>
        {visible => (
          <section>
            <div>
              <AnimatedVignette
                paused={!visible}
                transitions={[transitionsByName.doorway]}
                transitionsParams={[transitionParams]}
                easings={[BezierEasing(...easing)]}
                images={images}
                preload={allImagesToPreload}
                width={width}
                height={height}
                duration={duration}
                delay={delay}
                Footer={VignetteFooter}
                onDrawWithProgress={this.onDrawWithProgress}
              />
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: 10
                }}
              >
                <label style={{ display: "flex", flexDirection: "row" }}>
                  reflection
                  <input
                    style={{ flex: 1 }}
                    type="range"
                    name="reflection"
                    value={transitionParams.reflection}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={this.onTransitionParamsChange}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "row" }}>
                  depth
                  <input
                    style={{ flex: 1 }}
                    type="range"
                    name="depth"
                    value={transitionParams.depth}
                    min={1}
                    max={20}
                    step={0.1}
                    onChange={this.onTransitionParamsChange}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "row" }}>
                  perspective
                  <input
                    style={{ flex: 1 }}
                    type="range"
                    name="perspective"
                    value={transitionParams.perspective}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={this.onTransitionParamsChange}
                  />
                </label>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  flexWrap: "wrap"
                }}
              >
                <BezierEasingEditorWithProgressSetter
                  ref={this.onBezierEditorRef}
                  value={easing}
                  onChange={this.onEasingChange}
                  width={bezierEasingSize}
                  height={bezierEasingSize}
                  padding={[60, 60, 60, 60]}
                  background="transparent"
                  gridColor="#444"
                  curveColor="#b82"
                  handleColor="#fc6"
                  progressColor="#fc6"
                  textStyle={{
                    fill: "#fc6"
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                  }}
                >
                  <label style={{ display: "flex", flexDirection: "row" }}>
                    duration{" "}
                    <input
                      style={{ flex: 1 }}
                      type="range"
                      value={duration}
                      min={100}
                      max={6000}
                      step={100}
                      onChange={this.onDurationChange}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "row" }}>
                    delay{" "}
                    <input
                      style={{ flex: 1 }}
                      type="range"
                      value={delay}
                      min={100}
                      max={2000}
                      step={100}
                      onChange={this.onDelayChange}
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>
        )}
      </TrackVisibility>
    );
  }
}

class VideoExample extends PureComponent {
  props: {
    width: number,
    height: number
  };
  render() {
    const { width } = this.props;
    return (
      <TrackVisibility>
        {visible => (
          <section className="full-width">
            <AnimatedVignette
              interaction
              paused={!visible}
              transitions={transitionsOrderByRandom}
              images={
                !visible
                  ? [null]
                  : [
                      // this works precisely working because of gl-react ;)
                      <video key={1} autoPlay loop>
                        <source type="video/webm" src={cut1webm} />
                        <source type="video/mp4" src={cut1mp4} />
                      </video>,
                      <video key={2} autoPlay loop>
                        <source type="video/webm" src={cut2webm} />
                        <source type="video/mp4" src={cut2mp4} />
                      </video>,
                      <video key={3} autoPlay loop>
                        <source type="video/webm" src={cut3webm} />
                        <source type="video/mp4" src={cut3mp4} />
                      </video>
                    ]
              }
              width={width}
              height={Math.round((width * 544) / 1280)}
              duration={3000}
              delay={500}
              keepRenderingDuringDelay
              Footer={VignetteFooter}
            />
          </section>
        )}
      </TrackVisibility>
    );
  }
}

export default class Intro extends Component {
  state = {
    loadGif: false
  };
  _timeout: *;
  componentDidMount() {
    this._timeout = setTimeout(() => this.setState({ loadGif: true }), 1000);
  }
  componentWillUnmount() {
    clearTimeout(this._timeout);
  }
  render() {
    const { loadGif } = this.state;
    let maxWidth = Infinity;
    if (window.screen) {
      maxWidth = window.screen.width;
    }

    const imgWidth = Math.min(512, maxWidth);
    const imgHeight = Math.round((imgWidth * 384) / 512);

    return (
      <div className="Intro">
        <header>
          The Open Collection of <Logo />
        </header>
        <section>
          <Preview width={imgWidth} height={imgHeight} />
          <div>
            <p>
              GLSL is a <strong>powerful</strong> and easy to learn language,
              perfect for image effects. It is in fact the{" "}
              <strong>ultimate language to implement Transitions</strong> in!
            </p>
            <p>
              It's <strong>highly performant</strong> (GLSL runs on the GPU),{" "}
              <strong>universal</strong> (OpenGL is available everywhere),{" "}
              <strong>customizable</strong> (each transition can have many
              parameters) and can be run over any pixel source like images,
              videos, canvas,...
            </p>
            <p>
              This Open Source initiative aims to establish an universal
              collection of transitions that various softwares can use
              (including Movie Editors).
            </p>
          </div>
        </section>
        <header id="spec">
          What are <Logo />?
        </header>

        <section>
          <div>
            <GlslCode
              code={`\
// transition of a simple fade.
vec4 transition (vec2 uv) {
  return mix(
    getFromColor(uv),
    getToColor(uv),
    progress
  );
}`}
            />
            <footer>
              <Link className="btn" to="/editor">
                Experiment with this code
              </Link>
            </footer>
          </div>
          <div>
            <p>
              A GL Transition is a GLSL code that implements a{" "}
              <code>transition</code> coloring function: For a given{" "}
              <code>uv</code> pixel position, returns a color representing the
              mix of the <strong>source</strong> to the{" "}
              <strong>destination</strong> textures based on the variation of a
              contextual <code>progress</code> value from <code>0.0</code> to{" "}
              <code>1.0</code>.
            </p>
            <p>
              <a href={"https://github.com/" + githubRepoPath}>
                More specification can be found on <FaGithub /> Github
              </a>
              .
            </p>
          </div>
        </section>

        <header id="github">
          <a href={"https://github.com/" + githubRepoPath}>
            <Logo />
            are on <FaGithub /> Github
          </a>
        </header>
        <section>
          <div>
            {loadGif ? (
              <img alt="" className="full" src={require("./github.gif")} />
            ) : (
              <div style={{ height: 455 }} />
            )}
          </div>
          <div>
            <p>
              There is currently{" "}
              <strong>{transitionsOrderByRandom.length} transitions</strong>{" "}
              created by many contributors ❤️ and released under a{" "}
              <strong>Free License</strong>.
            </p>
            <p>
              The initiative is <strong>community driven</strong>, managed on{" "}
              <a href={"https://github.com/" + githubRepoPath}>Github</a>. PRs
              are reviewed and validated by a 🤖bot.
            </p>
            <p>
              <strong>You can directly send PRs from this website!</strong>
            </p>
          </div>
        </section>

        <header id="configurable">
          <Logo /> are configurable
        </header>

        <ConfigurableExample width={imgWidth} height={imgHeight} />

        <header id="video">
          <Logo /> works for Videos
        </header>

        <VideoExample width={Math.min(1024, maxWidth)} />

        <header id="ecosystem">
          <Logo /> ecosystem
        </header>

        <section>
          <div>
            <a href="https://www.npmjs.com/package/gl-transitions">
              <code>gl-transitions</code>
            </a>{" "}
            gets auto-published on NPM.
            <ul>
              <li>
                <code>npm install gl-transitions --save</code>
              </li>
              <li>
                or embed it:{" "}
                <a
                  className="small"
                  href="https://unpkg.com/gl-transitions@1/gl-transitions.js"
                >
                  https://unpkg.com/gl-transitions@1/gl-transitions.js
                </a>
              </li>
              <li>
                or a JSON:{" "}
                <a
                  className="small"
                  href="https://unpkg.com/gl-transitions@1/gl-transitions.json"
                >
                  https://unpkg.com/gl-transitions@1/gl-transitions.json
                </a>
              </li>
            </ul>
          </div>
          <div>
            You can draw GL transitions and in various environments:
            <ul>
              <li>
                <strong>In Vanilla WebGL code,</strong>{" "}
                <a href="https://www.npmjs.com/package/gl-transition">
                  <code>gl-transition</code>
                </a>{" "}
                exposes a draw function to render a GL Transition frame.
              </li>
              <li>
                <strong>
                  With <a href="https://github.com/regl-project/regl">regl</a>,
                </strong>{" "}
                <a href="https://www.npmjs.com/package/regl-transition">
                  <code>regl-transition</code>
                </a>{" "}
                exposes a function to render a GL Transition with a regl
                context.
              </li>
              <li>
                <strong>In React paradigm,</strong>{" "}
                <a href="https://www.npmjs.com/package/react-gl-transition">
                  <code>react-gl-transition</code>
                </a>{" "}
                exposes a {"<GLTransition />"} component to use in a{" "}
                <a href="https://github.com/gre/gl-react">gl-react</a>
                's Surface. This is what this app uses heavily.
              </li>
              <li>
                <strong>In CLI,</strong>{" "}
                <a href="https://www.npmjs.com/package/gl-transition-scripts">
                  <code>gl-transition-scripts</code>
                </a>{" "}
                exposes a <em>gl-transition-render</em> command to render a
                Transition to an image file. Our bot uses that to render a GIF
                and put it in the PRs! Travis also validates the transitions
                that gets committed with the <em>gl-transition-transform</em>{" "}
                command.
              </li>
              <li>
                In a node.js server you can use{" "}
                <a href="https://github.com/stackgl/headless-gl">
                  headless <code>gl</code>
                </a>{" "}
                and obviously{" "}
                <a href="https://www.npmjs.com/package/gl-transition">
                  gl-transition
                </a>{" "}
                to render a transition on server side. Which is what the{" "}
                <em>gl-transition-render</em> command is doing.
              </li>
              <li>
                <a href="https://github.com/gre/gl-transition-libs">
                  ...more environments and languages to support are welcomed to
                  contributions.
                </a>
              </li>
            </ul>
          </div>
        </section>

        <header>
          That's it folks! Get to your shader code{" "}
          <span role="img" aria-label="">
            ❤️
          </span>
        </header>

        <footer>
          <Link className="btn" to="/editor">
            Create a new Transition
          </Link>
        </footer>
      </div>
    );
  }
}
