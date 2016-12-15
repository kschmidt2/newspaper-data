function generalChart(divSelector, dataFile, groupType) {

  // margins
  var margin = {top: 10, right: 30, bottom: 40, left: 30},
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  // create responsive svg
  var svg = d3.select(divSelector)
      .append("div")
      .classed("svg-container", true) //container class to make it responsive
      .append("svg")
      //responsive SVG needs these 2 attributes and no width and height attr
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 785 500")
      //class to make it responsive
      .classed("svg-content-responsive", true)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x0 = d3.scaleBand()
      .rangeRound([0, width]);

  var x1 = d3.scaleBand()
      .rangeRound([0, width]);

  var y = d3.scaleLinear()
      .range([0, height]);

  var xAxis = d3.axisBottom(x0)
      .scale(x0);

  var yAxis = d3.axisLeft()
      .scale(y)
      .tickSize(-width);

  function generateData() {
    d3.csv(dataFile,
        function(error, data) {
          if (error) throw error;

          var areaType = d3.keys(data[0]).filter(function(key) { return key !== groupType; });

          console.log(data);

          data.forEach(function(d) {
            d.values = areaType.map(function(name) {
                return {name: name, value: +d[name]};
            });

            console.log(d.values);

          });

          x0.domain(data.map(function(d) { return d[groupType]; })).paddingInner(0.25).paddingOuter(0.25);
          x1.domain(areaType).range([0, x0.bandwidth()]).paddingInner(.1);
          y.domain([d3.max(data, function(d) { return d3.max(d.values, function(d) { return d.value; }); }), 0]);

          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Population");

          var category = svg.selectAll(".category")
              .data(data)
            .enter().append("g")
              .attr("class", function(d) { return "category " + d[groupType] })
              .attr("transform", function(d) { return "translate(" + x0(d[groupType]) + ",0)"; });

          category.selectAll("rect")
          .data(function(d) { return d.values; })
            .enter().append("rect")
              .attr("width", x1.bandwidth())
              .attr("x", function(d) { return x1(d.name); })
              .attr("y", function(d) { return y(d.value); })
              .attr("height", function(d) { return height - y(d.value); })
              .attr("class", function(d) { return d.name});


        });
  }

  generateData()

};


generalChart('#general-chart', 'data/region_count.csv', 'area_type');
generalChart('#circ-chart', 'data/closures_by_circ.csv', 'circ_group');
generalChart('#poverty-chart', 'data/poverty_count.csv', 'poverty_group');
