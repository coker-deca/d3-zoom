import "./style.css";

import * as d3 from "d3";
import React, { FC, useEffect, useMemo } from "react";
import { PieArcDatum } from "d3";

export type PieDataType = { color: string; size: number };
// type DataType = { CategoryName: string; SkillProficiencyId: number; children: PieDataType[] };

const Canvas: FC = () => {
  const data = useMemo(
    () => [
      {
        CategoryName: "Adaptive Security",
        SkillProficiencyId: 1,
        children: [
          { color: "red", size: 5 },
          { color: "green", size: 2 },
          { color: "blue", size: 3 },
        ],
      },
      {
        CategoryName: "Programmer",
        SkillProficiencyId: 2,
        children: [
          { color: "red", size: 1 },
          { color: "green", size: 4 },
          { color: "blue", size: 5 },
        ],
      },
      {
        CategoryName: "Coffee Drinker",
        SkillProficiencyId: 3,
        children: [
          { color: "red", size: 2 },
          { color: "green", size: 2 },
          { color: "blue", size: 6 },
        ],
      },
      {
        CategoryName: "Another Node",
        SkillProficiencyId: 4,
        children: [
          { color: "red", size: 3 },
          { color: "green", size: 3 },
          { color: "blue", size: 4 },
        ],
      },
    ],
    []
  );
  const cxBase = 200;
  const cxOffset = 100;
  const WIDTH = 1000;
  const HEIGHT = 460;

  function getBoundingBox(selection) {
    /* get x,y co-ordinates of top-left of bounding box and width and height */
    const element = selection.node();
    const bbox = element.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    return [bbox.x, bbox.width, bbox.y, bbox.height, cx, cy];
  }

  useEffect(() => {
    let defaultScale = 0.6;
    let scale = 3;
    d3.selectAll(".svgs").remove();
    const svg = d3
      .select("#dataviz_basicZoom")
      .append("svg")
      .attr("class", "svgs")
      .attr("style", "border:1px solid black")
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .attr("fill", "#fffdd0")
      .call(
        d3.zoom<SVGSVGElement, unknown>().on("zoom", function (event) {
          svg.attr("transform", event.transform);
        })
      );
    const resetAll = () => {
      svg.selectAll("g").selectAll("circle").attr("class", "normal");
      svg.selectAll("g").selectAll("text").attr("class", "label");
    };

    const zoomed = (d) => {
      const xy = getBoundingBox(d);
      if (d.classed("active")) {
        d.attr("class", "normal");
        svg
          .selectAll("g")
          .transition()
          .duration(750)
          .attr("transform", "scale(" + defaultScale + ")");
      } else {
        resetAll();
        scale = Math.min(WIDTH / xy[1], HEIGHT / xy[3], 3);
        const tx = -xy[0] + (HEIGHT - xy[1] * scale) / (2 * scale);
        const ty = -xy[2] + (HEIGHT - xy[3] * scale) / (2 * scale);
        svg
          .selectAll("g")
          .transition()
          .duration(750)
          .attr(
            "transform",
            "scale(" + scale + ")translate(" + tx + "," + ty + ")"
          );
        d.attr("class", "active");
      }
    };

    svg
      .selectAll("g")
      .data(data)
      .join((enter) => enter.append("g"))
      .each(function (props, index) {
        const cx = cxBase * index + cxOffset;
        d3.select(this)
          .append("circle")
          .attr("class", "normal")
          .attr("cx", cx)
          .attr("cy", 300)
          .attr("r", 40)
          .on("mouseover", function (d) {
            const text = d.path[1]["childNodes"][1];
            text.className.baseVal = "show";
            if (d3.select(this).classed("active")) return;
            d3.select(this).attr("class", "hover");
          })
          .on("mouseout", function (d) {
            const text = d.path[1]["childNodes"][1];
            if (d3.select(this).classed("active")) return;
            text.className.baseVal = "label";
            d3.select(this).attr("class", "normal");
          })
          .on("click", function (d) {
            const text = d.path[1]["childNodes"][1];
            text.className.baseVal = "show";
            zoomed(d3.select(this));
          })
          .on("focus", function (d) {
            const g = d3.select(this).append("g");
            const pie = d3.pie<PieDataType>();
            const arc = d3
              .arc<PieArcDatum<PieDataType>>()
              .innerRadius(0)
              .outerRadius(50);
            const arcs = g
              .selectAll("arc")
              .data(pie(props.children))
              .enter()
              .append("g");

            arcs
              .append("path")
              .attr("fill", function (data, i) {
                // console.log(data);
                // let value = data.data;
                return d3.schemeSet3[i];
              })
              .attr("d", arc);
            arcs
              .append("text")
              .attr("class", "pie-text")
              .attr("transform", (d) => {
                return "translate(" + arc.centroid(d) + ")";
              })
              .text(function (d) {
                return d.data.color;
              });
          });
        d3.select(this)
          .append("text")
          .attr("class", "label")
          .attr("x", cx)
          .attr("y", 300)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("fill", "#000000")
          .text(function (d) {
            return props.CategoryName;
          });
      });
  }, [data]);
  return (
    <div>
      <div id="dataviz_basicZoom"></div>
    </div>
  );
};

export default Canvas;
