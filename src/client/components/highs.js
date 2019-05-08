import React, { Component } from "react";
import { processResponse } from "../utils";

import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import Loading from "./loading";

class HighComponent extends Component {
  static defaultProps = {
    hasLoaded: function() {}
  };

  state = {
    data: {},
    isLoading: true,
    error: null
  };

  componentDidMount() {
    fetch(`/v1/${this.props.highType}-highs`)
      .then(res => processResponse(res))
      .then(data => {
        this.props.hasLoaded();
        this.setState({
          data,
          isLoading: false
        });
      })
      .catch(error => {
        this.props.hasLoaded();
        this.setState({
          isLoading: false,
          error
        });
      });
  }

  renderHeader() {
    let { highType, noHeader } = this.props;

    if (noHeader) return null;

    return (
      <Typography variant="h5" component="h2" gutterBottom>
        {highType.charAt(0).toUpperCase() + highType.slice(1)} High
      </Typography>
    );
  }

  render() {
    let { data, isLoading, error } = this.state;

    if (isLoading) {
      return <Loading />;
    }

    if (error) {
      return (
        <span>
          Robert needs to fix this: {error.text} ({error.status})
        </span>
      );
    }

    return (
      <Card data-test-high-component>
        <CardContent>
          {this.renderHeader()}
          <Typography variant="body1" gutterBottom>
            Temp: {parseFloat(data.highTemp).toFixed(2)} F
          </Typography>
          <Typography variant="body1" gutterBottom>
            Pressure: {parseFloat(data.highPressure).toFixed(2)} hPa
          </Typography>
          <Typography variant="body1" gutterBottom>
            Humidity: {parseFloat(data.highHumidity).toFixed(2)} %
          </Typography>
          <Typography variant="body1" gutterBottom>
            Wind Speed: {parseFloat(data.highWindSpeed).toFixed(2)} mph
          </Typography>
          <Typography variant="body1">
            Total Rain: {parseFloat(data.totalRain).toFixed(2)} in
          </Typography>
        </CardContent>
      </Card>
    );
  }
}

export default HighComponent;