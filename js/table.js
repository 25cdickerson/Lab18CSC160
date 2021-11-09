import * as d3 from "d3";

//employees is the array of data
//target is the selection of the g element to place the graph in
//xscale,yscale are the x and y scales.
var drawPlot = function (
  employees,
  target,
  senorityScale,
  salaryScale,
  areaScale
) {
  target
    .selectAll("circle")
    .data(employees)
    .enter()
    .append("circle")
    .attr("cx", function (employee) {
      return senorityScale(employee.Senority);
    })
    .attr("cy", function (employee) {
      return salaryScale(employee.salary);
    })
    .attr("r", 3)
    //.attr("opacity", ".5") if there was more overlap, I would turn this on
    .attr("class", function (employee) {
      return employee.Area;
    })
    .style("fill", function (employee) {
      return areaScale(employee.Area);
    });
};

//This is a helpful function to make creating the translate strings easier
var makeTranslateString = function (x, y) {
  return "translate(" + x + "," + y + ")";
};

//graphDim is an object that describes the width and height of the graph area.
//margins is an object that describes the space around the graph
//xScale and yScale are the scales for the x and y scale.
var drawAxes = function (
  graphDim,
  margins,
  senorityScale,
  salaryScale,
  areaScale
) {
  var xAxis = d3.axisBottom(senorityScale);

  var yAxis = d3.axisLeft(salaryScale);

  d3.selectAll("svg")
    .append("g")
    .attr("class", "axis")
    .attr(
      "transform",
      makeTranslateString(margins.left, graphDim.height + margins.top)
    )
    .call(xAxis);

  d3.selectAll("svg")
    .append("g")
    .attr("class", "axis")
    .attr("transform", makeTranslateString(margins.left, margins.top))
    .call(yAxis);
};

//graphDim -object that stores dimensions of the graph area
//margins - objedct that stores the size of the margins
var drawLabels = function (graphDim, margins) {
  var centerX = graphDim.width / 2 + margins.left;
  var centerY = graphDim.height / 2 + margins.top;

  var xLabel = d3
    .selectAll("svg")
    .append("g")
    .attr("class", "label")
    .attr(
      "transform",
      makeTranslateString(
        centerX,
        graphDim.height + margins.top + margins.bottom - 5
      )
    );

  xLabel.append("text").attr("text-anchor", "middle").text("Seniority");

  var yLabel = d3
    .selectAll("svg")
    .append("g")
    .attr("class", "label")
    .attr("transform", "translate( 5," + centerY + ") rotate(90)");

  yLabel.append("text").attr("text-anchor", "middle").text("Salary");

  var tLabel = d3.selectAll("svg").append("g").attr("class", "label");
  tLabel
    .append("text")
    .attr("text-anchor", "middle")
    .text("Senority vs Salary")
    .attr("transform", "translate(" + centerX + ", 25)");
};

var drawLegend = function (
  graphDim,
  margins,
  senorityScale,
  salaryScale,
  areaScale
) {
  //this array might be helpful
  var areas = ["Janitorial", "Production", "Management", "Executive"];

  var legend = d3
    .select("svg")
    .append("g")
    .attr("class", "legend")
    .attr("transform", makeTranslateString(graphDim.width, margins.top));

  var entries = legend
    .selectAll("g")
    .data(areas)
    .enter()
    .append("g")
    .attr("class", "entry")
    .attr("fill", function (area) {
      return areaScale(area);
    })
    .attr("transform", function (area, index) {
      return "translate(0," + index * 20 + ")";
    });

  entries.append("rect").attr("width", 10).attr("height", 10);
  entries
    .append("text")
    .text(function (area) {
      return area;
    })
    .attr("x", 15)
    .attr("y", 10);
};

//sets up several important variables and calls the functions for the visualization.
var initGraph = function (employees) {
  //size of screen
  var screen = { width: 800, height: 600 };
  //how much space on each side
  var margins = { left: 50, right: 50, top: 50, bottom: 50 };

  var graph = {
    width: screen.width - margins.left - margins.right,
    height: screen.height - margins.top - margins.bottom
  };

  d3.select("svg").attr("width", screen.width).attr("height", screen.height);

  var target = d3
    .select("svg")
    .append("g")
    .attr("id", "plot")
    .attr("transform", makeTranslateString(margins.left, margins.top));

  var maxSenority = d3.max(employees, function (employee) {
    return Number(employee.Senority);
  });

  var senorityScale = d3
    .scaleLinear()
    .domain([0, maxSenority])
    .range([0, graph.width]);

  var maxSalary = d3.max(employees, function (employee) {
    return Number(employee.salary);
  });
  console.log("maxSalary", maxSalary);

  var salaryScale = d3
    .scaleLog()
    .domain([20000, maxSalary])
    .range([graph.height, 0]);

  var areaScale = d3.scaleOrdinal(d3.schemeCategory10);

  drawAxes(graph, margins, senorityScale, salaryScale, areaScale);
  drawPlot(employees, target, senorityScale, salaryScale, areaScale);
  drawLabels(graph, margins);
  drawLegend(graph, margins, senorityScale, salaryScale, areaScale);
};

var successFCN = function (employees) {
  console.log("employees", employees);
  initGraph(employees);
};

var failFCN = function (error) {
  console.log("error", error);
};

var empPromise = d3.csv("data/CompanyData.csv");
empPromise.then(successFCN, failFCN);
