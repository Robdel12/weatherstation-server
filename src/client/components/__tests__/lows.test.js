import React from "react";
import { mount } from "testing-hooks/react-dom";
import Lows from "../lows";
import LowsInteractor from "./lows.interactor.js";
import Pretender from "pretender";

describe("Lows Component", () => {
  let card = new LowsInteractor();
  let server;

  before(() => {
    server = new Pretender(function() {
      this.get(
        "/v1/daily-lows",
        request => {
          return [
            200,
            { "content-type": "application/javascript" },
            JSON.stringify({
              _id: null,
              lowTemp: 80.23232,
              lowPressure: 945.804993,
              lowHumidity: 23.376038
            })
          ];
        },
        100
      );

      this.get(
        "/v1/weekly-lows",
        request => {
          return [
            200,
            { "content-type": "application/javascript" },
            JSON.stringify({
              _id: null,
              lowTemp: 80.23232,
              lowPressure: 945.804993,
              lowHumidity: 23.376038
            })
          ];
        },
        100
      );

      this.get("http://localhost:5338/percy/healthcheck", this.passthrough);
      this.post("http://localhost:5338/percy/snapshot", this.passthrough);
    });
  });

  after(() => {
    server.shutdown();
  });

  it("renders", async () => {
    await mount(<Lows lowType="daily" />);

    await card.assert.heading.exists();
  });

  it("renders with mock data", async () => {
    await mount(<Lows lowType="daily" />);

    // prettier-ignore
    await card
      .assert.temp.text("Temp: 80.23 F")
      .assert.humidity.text("Humidity: 23.38 %")
      .assert.pressure.text("Pressure: 945.80 hPa")
      .snapshot('Daily')
  });

  it("changes the heading based on type", async () => {
    await mount(<Lows lowType="weekly" />);

    await card.assert.heading.text("Weekly Low").snapshot("Weekly");
  });

  it("shows the loading spinner", async () => {
    server.get(
      "/v1/weekly-lows",
      request => [200, { "content-type": "application/javascript" }, JSON.stringify({})],
      1500
    );

    await mount(<Lows lowType="weekly" />);

    await card.assert.loading.exists().snapshot("loading");
  });

  it("shows an error for network errors", async () => {
    server.get("/v1/weekly-lows", request => [500, { "content-type": "application/javascript" }, "{}"]);

    await mount(<Lows lowType="weekly" />);

    await card.assert.error.text("Robert needs to fix this: Internal Server Error (500)").snapshot("error");
  });

  it("fires the hasLoaded event", async () => {
    let didLoad = false;

    await mount(<Lows lowType="daily" hasLoaded={() => (didLoad = true)} />);

    // prettier-ignore
    await card.assert.heading.exists()
      .assert(() => didLoad === true);
  });
});
