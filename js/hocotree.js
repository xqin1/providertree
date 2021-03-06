var treedata = {};
var hocodata, hocokey, statename;
var  dbaToolTip = CustomTooltip("dba_tooltip", 200);
var popFormat = d3.format(",.1s");
var svg,tree,animGroup;

//getting from PHP
var hocoParas = 'Verizon Communications Inc.'; //HOCO NAME
var stateParas = '42'; //Stae Fips or 'all'

var paras=window.location.href.split("?");
//console.log(paras);
if (paras.length==0){
	//alert("No HOCO or STATE selected");
}
else{
  var para = paras[1].split("/");
	hocoParas=decodeURI(para[1]);//HOCO name
	stateParas=decodeURI(para[3]);;//state fips
}

var margin = {top: 20, right: 0, bottom: 20, left: 0},
    width = parseInt(d3.select('#treeGraph').style('width'));
    //width = width - margin.right - margin.left,
    //mapRatio = 0.9
    //height = width*mapRatio - margin.top - margin.bottom;
    
var i = 0,
    duration = 750,
    root;

// var tree = d3.layout.tree()
//     .size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

// var svg = d3.select("#treeGraph").append("svg")
//     .attr("width", width + margin.right + margin.left)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//       .attr("id", "layout")
//      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// svg.append("svg:clipPath").attr("id", "clipper")
//         .append("svg:rect")
//         .attr('id', 'clip-rect');

//     var animGroup = d3.select("#layout").append("svg:g")
//         .attr("id", "animation")
//         .attr("clip-path", "url(#clipper)");


queue()
	.defer(d3.csv, "data/hocodata.csv")
  .defer(d3.csv, "data/statename.csv")
	.await(ready);

function ready(error, hoco, state){
	if (error) throw error;
  statename = d3.nest().key(function(d){return d.statefips}).map(state);
	//var hocodata, hocokey;
  hocodata = hoco.filter(function(d){return d.HoCoName == hocoParas});
	// if (stateParas == "all"){
	// 	hocodata = hoco.filter(function(d){return d.HoCoName == hocoParas});
	// }else{
	// 	hocodata = hoco.filter(function(d){return d.HoCoName == hocoParas && d.StateFIPS == stateParas});
	// }
	hocodata.forEach(function(d){
		d.HoCoName = d.HoCoName.toUpperCase().toProperCase();
		d.ProvName = d.ProvName.toUpperCase().toProperCase();
		d.DBAName = d.DBAName.toUpperCase().toProperCase();
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

	treedata.name = hocodata[0].HoCoName;
	treedata.children = [];
  treedata.numOfDBA = 0;
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
        treedata.numOfDBA++;
	    })
	   treedata.children.push(provObj);
	})
  //define height
  height = treedata.numOfDBA < 5 ? 150 :
            treedata.numOfDBA < 10 ? 250 :
              treedata.numOfDBA < 15? 350 : 
                treedata.numOfDBA < 20? 450:
                  treedata.numOfDBA < 25? 550:
                    treedata.numOfDBA < 30? 650:
                    treedata.numOfDBA < 35? 750:
                    treedata.numOfDBA < 40? 850:
                    treedata.numOfDBA < 45? 1050: 1250;
  margin.left = treedata.name.length < 10 ? 60 :
                  treedata.name.length < 25 ? 160 :
                  treedata.name.length < 40 ? 260 :
                  treedata.name.length < 45 ? 310 :
                  treedata.name.length < 50 ? 350 :
                  treedata.name.length < 55 ? 400 : 450;
  tree = d3.layout.tree()
    .size([height, width]);


 svg = d3.select("#treeGraph").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("id", "layout")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("svg:clipPath").attr("id", "clipper")
        .append("svg:rect")
        .attr('id', 'clip-rect');

   animGroup = d3.select("#layout").append("svg:g")
        .attr("id", "animation")
        .attr("clip-path", "url(#clipper)");

	if (treedata.children.length == 0){

	}else{
	  treedata.x0 = height / 2;
	  treedata.y0 = 0;

	  // function collapse(d) {
	  //   if (d.children) {
	  //     d._children = d.children;
	  //     d._children.forEach(collapse);
	  //     d.children = null;
	  //   }
  	//  }

  	//root.children.forEach(collapse);

  	update(treedata);
	}
}

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(treedata).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
 // nodes.forEach(function(d) { d.y = d.depth * 180; });
 nodes.forEach(function(d) {console.log(d);d.y = d.depth == 0 ? 20:
                               d.depth ==1 ?  300 : 380 });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      //.attr("class", "node")
      .attr("class", function(d){return d.depth==0 ? "node root" : "node"})
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click)
      .on("mouseover", mouseover )
      .on("mouseout", mouseout);

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", function(d) {return d.depth==1 && d.parent.children.length==1 ?  "1.5em" : ".35em"})
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6)

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1)


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
      //.attr("class", "link")
      .attr("class", function(d){
        if (d.target.depth == 2){ 
            if (d.target.StateFIPS.indexOf(stateParas) != -1){
              return "link selected";
            }
            else{
              return "link";
            }
        }
        else if (d.target.depth == 1){
            if (typeof d.target.children != 'undefined'){
              if (d.target.children != null){
                var isStateLink = false;
                d.target.children.forEach(function(c){
                  if (c.StateFIPS.indexOf(stateParas) != -1){
                    isStateLink = true;
                  }
                })
                return isStateLink ? "link selected" : "link";
              }
            }
        }
      })
      .attr("d", function(d) {
        //console.log(d.target)
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
  if (d.depth != 0){
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
  }

}

function mouseover(d){
  if (d.depth == 2){
   //console.log (d);
   var sn = [];
   d.StateFIPS.forEach(function(s){
      sn.push(statename[s][0].statenameabbr);
   })
   sn.sort(d3.ascending, function(a,b){return a-b});
    var content = "";
    content += "<span class='title'>DBA: </span><span class='title'>" + d.name + "</span></br>";
    content += "<span class='name'>Population Served: </span><span class='value'>" + popFormat(d.Pop_Served) + "</span></br>";
    content += "<span class='name'>State Served: </span><span class='value'>" + sn.join(', ') + "</span>";
    // content += "<span class='name'>Action: </span><span class='value'>" + d.action + "</span>";
    // content += "<span class='separator'>&nbsp;|&nbsp;</span>";
    // content += "<span class='name'>Cost: </span><span class='value'>" + formatMoney(d.result_payment) + "</span>";
    dbaToolTip.showTooltip(content,d3.event);

    var ancestors = [];
    var parent = d;
    while (typeof parent != "undefined") {
        ancestors.push(parent);
        parent = parent.parent;
    }

    // Get the matched links
   var matchedLinks=[]
    svg.selectAll('path.link').filter(function(d){
         ancestors.forEach(function(p){
            if (p === d.target){
                matchedLinks.push(d)
            }
        })
    })
    svg.selectAll('path.selectedState').filter(function(d){
         ancestors.forEach(function(p){
            if (p === d.target){
                matchedLinks.push(d)
            }
        })
    })

     var linkRenderer = d3.svg.diagonal()
        .projection(function(d)
        {
            return [d.y, d.x];
        });

    // Links
    // ui.animGroup.selectAll("path.selected")
    //     .data([])
    //     .exit().remove();

    d3.select("#animation")
        .selectAll("path.selected")
        .data(matchedLinks)
        .enter().append("svg:path")
        .attr("class", "selected")
        .attr("d", linkRenderer);

    // Animate the clipping path
    var overlayBox = svg.node().getBBox();

    svg.select("#clip-rect")
        .attr("x", overlayBox.x + overlayBox.width)
        .attr("y", overlayBox.y)
        .attr("width", 0)
        .attr("height", overlayBox.height)
        .transition().duration(1000)
        .attr("x", overlayBox.x)
        .attr("width", overlayBox.width);
  }
}

function mouseout(d){
  if (d.depth ==2){
    console.log('mouseout');
    dbaToolTip.hideTooltip();

    // Links
    svg.select('#animation').selectAll("path.selected")
        .data([])
        .exit().remove();
  }
}

String.prototype.toProperCase = function() {
    var aStr = this.split(' ');
    var aProp = [];
    for (str in aStr) {
      aStr[str] != "LLC" ? aProp.push(aStr[str].charAt(0).toUpperCase() + aStr[str].slice(1).toLowerCase()) : aProp.push(aStr[str]);
    }
    return aProp.join(' ');
};


