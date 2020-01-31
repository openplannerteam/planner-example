import React, { Component } from "react";

import Worker from "../../sevices/planner.worker";
import styles from "./FormContainer.module.css";

class FormContainer extends Component {
  constructor() {
    super();

    this.state = {};

    this.handleChange = this.handleChange.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.workerTest = this.workerTest.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.id]: event.target.value });
  }

  componentDidMount() {
    this.worker = new Worker();
  }

  workerTest() {
    this.worker.postMessage("test");
    this.worker.addEventListener("message", e => {
      console.log("response from the worker");
      console.log(e);
    });
  }

  render() {
    return (
      <div id="article-form">
        <button className={styles.button} onClick={this.workerTest}>
          Test worker
        </button>
      </div>
    );
  }
}

export default FormContainer;
