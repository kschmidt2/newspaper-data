function generalChart(divSelector, dataFile, groupType, detailsParam) {

  // margins
  var margin = {top: 10, right: 30, bottom: 40, left: 60},
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

          var areaType = d3.keys(data[0]).filter(function(key) { return key !== groupType && key !== 'major_closed' && key !== 'minor_closed' && key !== 'rural_closed' && key !== 'rural_total' && key !== 'major_total' && key !== 'minor_total'});

          data.forEach(function(d) {
            d.values = areaType.map(function(name) {
                return {name: name, value: +d[name]};
            });

          });

          console.log(data);

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
              .attr("transform", function(d) { return "translate(" + x0(d[groupType]) + ",0)"; })
              .on('mouseleave', hoverOut);

          if (dataFile == 'data/region_count.csv') {
            category.on('mouseover', generalDetails1)
          }
          if (dataFile == 'data/region_circ.csv') {
            category.on('mouseover', generalDetails2)
          }
          if (dataFile == 'data/ownership.csv') {
            category.on('mouseover', generalDetails3)
          }
          if (dataFile == 'data/closures_by_circ.csv') {
            category.on('mouseover', circDetails)
          }
          if (dataFile == 'data/poverty_count.csv') {
            category.on('mouseover', povertyDetails1)
          }
          if (dataFile == 'data/poverty_circ.csv') {
            category.on('mouseover', povertyDetails2)
          }

          category.selectAll("rect")
          .data(function(d) { return d.values; })
            .enter().append("rect")
              .attr("width", x1.bandwidth())
              .attr("x", function(d) { return x1(d.name); })
              .attr("y", function(d) { return y(d.value); })
              .attr("height", function(d) { return height - y(d.value); })
              .attr("class", function(d) { return d.name});


          function hoverOut(){
            $('#general-hover').html('');
            $('#circ-hover').html('');
            $('#poverty-hover').html('');
          }


          function generalDetails1 (d) {
            details = '<h4>' + d.area_type + '</h4>';
            details+= '<b>Total papers 2004:</b> ' + Number(d.count_2004).toLocaleString();
            details+= '<br/><b>Total papers 2014:</b> ' + Number(d.count_2014).toLocaleString();
            $('#general-hover').html(details);
          }

          function generalDetails2 (d) {
            details = '<h4>' + d.area_type + '</h4>';
            details+= '<b>Total circulation 2004:</b> ' + Number(d.circ_2004).toLocaleString();
            details+= '<br/><b>Total circulation 2014:</b> ' + Number(d.circ_2014).toLocaleString();
            $('#general-hover').html(details);
          }

          function generalDetails3 (d) {
            details = '<h4>' + d.area_type + '</h4>';
            details+= '<b>Papers with independent ownership 2004:</b> ' + Number(d.ind_owner_2004.toLocaleString());
            details+= '<br/><b>Papers with independent ownership 2014:</b> ' + Number(d.ind_owner2014).toLocaleString();
            $('#general-hover').html(details);
          }

          function circDetails (d) {
            details = '<h4>Circulation group ' + d.circ_group + '</h4>';
            details+= '<b>Total major 2004:</b> ' + Number(d.major_total).toLocaleString();
            details+= '<br/><b>Major closed:</b> ' + Number(d.major_closed).toLocaleString();
            details+= '<br/><b>Major percentage closed:</b> ' + Number(d.major_percent*100).toFixed(1) + '%';
            details+= '<br/><br/><b>Total minor 2004:</b> ' + Number(d.minor_total).toLocaleString();
            details+= '<br/><b>Minor closed:</b> ' + Number(d.minor_closed).toLocaleString();
            details+= '<br/><b>Minor percentage closed:</b> ' + Number(d.minor_percent*100).toFixed(1) + '%';
            details+= '<br/><br/><b>Total rural 2004:</b> ' + Number(d.rural_total).toLocaleString();
            details+= '<br/><b>Rural closed:</b> ' + Number(d.rural_closed).toLocaleString();
            details+= '<br/><b>Rural percentage closed:</b> ' + Number(d.rural_percent*100).toFixed(1) + '%';
            $('#circ-hover').html(details);
          }

          function povertyDetails1 (d) {
            details = '<h4>Poverty level ' + d.poverty_group + '</h4>';
            details+= '<b>Total major 2004:</b> ' + Number(d.major_total).toLocaleString();
            details+= '<br/><b>Major closed:</b> ' + Number(d.major_closed).toLocaleString();
            details+= '<br/><b>Major percentage closed:</b> ' + Number(d.major_percent*100).toFixed(1) + '%';
            details+= '<br/><br/><b>Total minor 2004:</b> ' + Number(d.minor_total).toLocaleString();
            details+= '<br/><b>Minor closed:</b> ' + Number(d.minor_closed).toLocaleString();
            details+= '<br/><b>Minor percentage closed:</b> ' + Number(d.minor_percent*100).toFixed(1) + '%';
            details+= '<br/><br/><b>Total rural 2004:</b> ' + Number(d.rural_total).toLocaleString();
            details+= '<br/><b>Rural closed:</b> ' + Number(d.rural_closed).toLocaleString();
            details+= '<br/><b>Rural percentage closed:</b> ' + Number(d.rural_percent*100).toFixed(1) + '%';
            $('#poverty-hover').html(details);
          }

          function povertyDetails2 (d) {
            details = '<h4>Poverty level ' + d.poverty_group + '</h4>';
            details+= '<b>Major 2004:</b> ' + Number(d.major_circ_2004).toLocaleString();
            details+= '<br/><b>Major 2014:</b> ' + Number(d.major_circ_2014).toLocaleString();
            details+= '<br/><br/><b>Minor 2004:</b> ' + Number(d.minor_circ_2004).toLocaleString();
            details+= '<br/><b>Minor 2014:</b> ' + Number(d.minor_circ_2014).toLocaleString();
            details+= '<br/><br/><b>Rural 2004:</b> ' + Number(d.rural_circ_2004).toLocaleString();
            details+= '<br/><b>Rural 2014:</b> ' + Number(d.rural_circ_2014).toLocaleString();
            $('#poverty-hover').html(details);
          }


        });
  }

  generateData()

};


generalChart('#general-chart', 'data/region_count.csv', 'area_type', 'generalDetails1');
generalChart('#circ-chart', 'data/closures_by_circ.csv', 'circ_group', 'circDetails');
generalChart('#poverty-chart', 'data/poverty_count.csv', 'poverty_group', 'povertyDetails1');

$('#big-picture-total').on('click', function(){
  $('#big-picture-circ').removeClass('active')
  $('#big-picture-ownership').removeClass('active')
  $('#big-picture-total').addClass('active')
  $('#general-chart-div').html('')
  $('#general-chart-div').html('<div id="general-chart"></div>')
  generalChart('#general-chart', 'data/region_count.csv', 'area_type', 'generalDetails1')
  $('#general-chart-head').html('Total number of papers')
  $('#general-description').html("1,591 newspapers closed between 2004 and 2014, in all areas of the country. While rural papers don't dominate in influence, they rule in numbers. Many of the rural papers in the United States are weeklies with small circulation. The uptick in minor metro newspapers is likely due to demographic shifts rather than an increase in number of papers.")
});
$('#big-picture-circ').on('click', function(){
  $('#big-picture-total').removeClass('active')
  $('#big-picture-ownership').removeClass('active')
  $('#big-picture-circ').addClass('active')
  $('#general-chart-div').html('')
  $('#general-chart-div').html('<div id="general-chart"></div>')
  generalChart('#general-chart', 'data/region_circ.csv', 'area_type', 'generalDetails2')
  $('#general-chart-head').html('Total circulation')
  $('#general-description').html("Major metro papers are king when it comes to readership. In 2004, major metros had an average of 44,000 readers while minor metro papers had 28,000 and rural papers had 9,400. In 2014, thse numbers were 38,000, 23,000 and 8,000, respectively. But no matter the size, they've all experienced a significant decline in readership.")
});
$('#big-picture-ownership').on('click', function(){
  $('#big-picture-circ').removeClass('active')
  $('#big-picture-total').removeClass('active')
  $('#big-picture-ownership').addClass('active')
  $('#general-chart-div').html('')
  $('#general-chart-div').html('<div id="general-chart"></div>')
  generalChart('#general-chart', 'data/ownership.csv', 'area_type', 'generalDetails3')
  $('#general-chart-head').html('Independent ownership')
  $('#general-description').html("Another trend has emerged in the American newspaper industry since the turn of the century. Hedge funds and investment partnerships have bought up newspapers in hopes of turning a quick profit. These new owners generally lack journalism experience or the sense of civic mission traditionally embraced by publishers and editors. Rural papers are still the most likely to have independent owners, but hasve seen a sharper decline in this area.")
});
$('#poverty-total').on('click', function(){
  $('#poverty-circ').removeClass('active')
  $('#poverty-total').addClass('active')
  $('#poverty-chart-div').html('')
  $('#poverty-chart-div').html('<div id="poverty-chart"></div>')
  generalChart('#poverty-chart', 'data/poverty_count.csv', 'poverty_group', 'povertyDetails1')
  $('#poverty-legend').html('<i class="fa fa-circle major-2004"></i> Major metro area (pop. over 1M)<br/><i class="fa fa-circle minor-2004"></i> Minor metro area (pop. under 1M)<br/><i class="fa fa-circle rural-2004"></i> Rural area<br/>')
  $('#poverty-chart-head').html('Percent closed by county poverty level')
});
$('#poverty-circ').on('click', function(){
  $('#poverty-total').removeClass('active')
  $('#poverty-circ').addClass('active')
  $('#poverty-chart-div').html('')
  $('#poverty-chart-div').html('<div id="poverty-chart"></div>')
  generalChart('#poverty-chart', 'data/poverty_circ.csv', 'poverty_group', 'povertyDetails2')
  $('#poverty-legend').html('<i class="fa fa-circle major-2004"></i> Major metro area (pop. over 1M), 2004<br/><i class="fa fa-circle major-2014"></i> Major metro area (pop. over 1M), 2014<br/><i class="fa fa-circle minor-2004"></i> Minor metro area (pop. under 1M), 2004<br/><i class="fa fa-circle minor-2014"></i> Minor metro area (pop. under 1M), 2014<br/><i class="fa fa-circle rural-2004"></i> Rural area, 2004<br/><i class="fa fa-circle rural-2014"></i> Rural area, 2014<br/>')
  $('#poverty-chart-head').html('Circulation by county poverty level')
});
