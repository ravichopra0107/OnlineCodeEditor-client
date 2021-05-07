import React, { Component } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import Pusher from "pusher-js";
import pushid from "pushid";
import axios from "axios";

import "./App.css";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";

import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/css/css";
import "codemirror/mode/javascript/javascript";

class App extends Component {
  state = {
    id: "",
    html: "",
    css: "",
    js: "",
  };

  pusher = new Pusher("553aef48be56f84fe567", {
    cluster: "ap2",
    forceTLS: true,
  });
  channel = this.pusher.subscribe("editor");

  componentDidUpdate() {
    this.runCode();
  }

  componentDidMount() {
    this.setState({
      id: pushid(),
    });

    this.channel.bind("update", (data) => {
      if (data.id === this.state.id) return;

      this.setState({
        html: data.html,
        css: data.css,
        js: data.js,
      });
    });
  }

  syncUpdates = () => {
    const data = { ...this.state };

    axios.post("https://code-hacked.herokuapp.com/update-editor", data).catch((error) => {
      console.log(error);
    });
  };

  runCode = () => {
    const iframe = this.refs.iframe;
    const document = iframe.contentDocument;
    const documentContents = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Document</title>
        <style>
          ${this.state.css}
        </style>
      </head>
      <body>
        ${this.state.html}
        <script type="text/javascript">
          ${this.state.js}
        </script>
      </body>
      </html>
    `;

    document.open();
    document.write(documentContents);
    document.close();
  };

  render() {
    return (
      <div className="App">
        <section className="playground">
          <div className="code-editor html-code">
            <div className="editor-header">HTML</div>
            <CodeMirror
              value={this.state.html}
              options={{
                mode: "htmlmixed",
                theme: "material",
                lineNumbers: true,
                scrollbarStyle: null,
                lineWrapping: true,
              }}
              onBeforeChange={(editor, data, html) => {
                this.setState({ html }, () => this.syncUpdates());
              }}
            />
          </div>
          <div className="code-editor css-code">
            <div className="editor-header">CSS</div>
            <CodeMirror
              value={this.state.css}
              options={{
                mode: "css",
                theme: "material",
                lineNumbers: true,
                scrollbarStyle: null,
                lineWrapping: true,
              }}
              onBeforeChange={(editor, data, css) => {
                this.setState({ css }, () => this.syncUpdates());
              }}
            />
          </div>
          <div className="code-editor js-code">
            <div className="editor-header">JavaScript</div>
            <CodeMirror
              value={this.state.js}
              options={{
                mode: "javascript",
                theme: "material",
                lineNumbers: true,
                scrollbarStyle: null,
                lineWrapping: true,
              }}
              onBeforeChange={(editor, data, js) => {
                this.setState({ js }, () => this.syncUpdates());
              }}
            />
          </div>
        </section>
        <section className="result">
          <iframe title="result" className="iframe" ref="iframe" />
        </section>
      </div>
    );
  }
}

export default App;
