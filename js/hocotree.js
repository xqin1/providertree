var treedata = {};
var hocoParas,stateParas;
var hocodata, hocokey;

var paras=window.location.href.split("?");
//console.log(paras);
if (paras.length==1){
	alert("No HOCO or STATE selected");
}
else{
	var selects = paras[1].split("&");
	hocoParas=decodeURI(selects[0].split("=")[1]);//HOCO name
	stateParas=selects[1].split("=")[1];//state fips
}

var margin = {top: 20, right: 120, bottom: 20, left: 260},
    width = 960 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;
    
var i = 0,
    duration = 750,
    root;

var tree = d3.layout.tree()
    .size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("#treeGraph").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

queue()
	.defer(d3.csv, "data/hocodata.csv")
	.await(ready);

function ready(error, hoco){
	if (error) throw error;
	//var hocodata, hocokey;
	if (stateParas == "all"){
		hocodata = hoco.filter(function(d){return d.HoCoName == hocoParas});
	}else{
		hocodata = hoco.filter(function(d){return d.HoCoName == hocoParas && d.StateFIPS == stateParas});
	}
	hocodata.forEach(function(d){
		d.HoCoName = d.HoCoName.toUpperCase();
		d.ProvName = d.ProvName.toUpperCase();
		d.DBAName = d.DBAName.toUpperCase();
		d.Pop_Served = +d.Pop_Served;
	});

	hocoKey = d3.nest()
			.key(function(d){return d.ProvName})
			.key(function(d){return d.DBAName})
			.rollup(function(values){
				var fips =[];
				values.forEach(function(s){
				 	fips.push(s["StateFIPS"]);
				})
                return {
                    "Pop_Served": d3.sum(values, function(d){return d["Pop_Served"]}),
                    "StateFIPS":fips
                }
             })
			.entries(hocodata);

	treedata.name = hocoParas;
	treedata.children = [];
	hocoKey.forEach(function(d){
	    var provObj={};
	    provObj.name = d.key;
	    provObj.children =[];
	    d.values.forEach(function(v){
	      var dbaObj={};
	      dbaObj.name = v.key;
	      dbaObj.Pop_Served = v.values.Pop_Served;
	      dbaObj.StateFIPS = v.values.StateFIPS;
	      provObj.children.push(dbaObj);
	    })
	   treedata.children.push(provObj);
	})
	if (treedata.children.length == 0){

	}else{
	  treedata.x0 = height / 2;
	  treedata.y0 = 0;

	  function collapse(d) {
	    if (d.children) {
	      d._children = d.children;
	      d._children.forEach(collapse);
	      d.children = null;
	    }
  	  }

  	//root.children.forEach(collapse);
  	update(treedata);
	}
}

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(treedata).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click);

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}


