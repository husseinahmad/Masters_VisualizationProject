                var color_hash = [{"Cause":"Cancer","Color":"blue"},
                                      {"Cause":"Heart Disease","Color":"red"},
                                      {"Cause":"Unintentional Injury","Color":"green"},
                                      {"Cause":"Chronic Lower Respiratory Disease","Color":"orange"},
                                      {"Cause":"Stroke","Color":"purple"}];    

                var margin = {top: 20, right: 300, bottom: 50, left: 100},
                    width = 1260 - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom;

                 function GetCauseColor(cause)
                 {
                     for(i in color_hash)
                     {
                         if(color_hash[i].Cause == cause)
                             return color_hash[i].Color;
                     }
                 }

                function InitCharts()
                {
                    ReflectTreemapParagraphs(false);
                    ReflectPiechartParagraphs(false);

                    var xScale = d3.scale.linear()
                        .domain([2005, 2015])
                        .range([0, width]);

                    var yScale = d3.scale.linear()
                        .domain([0, 500000])
                        .range([height, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(xScale)
                        .orient("bottom")
                        .tickFormat(d3.format(""))
                        .innerTickSize(-height)
                        .outerTickSize(0)
                        .tickPadding(10);

                    var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient("left")
                        .tickFormat(d3.format("s"))
                        .innerTickSize(-width)
                        .outerTickSize(0)
                        .tickPadding(10);

                    var line = d3.svg.line()
                        .x(function(d) { return xScale(d.x); })
                        .y(function(d) { return yScale(d.y); });

                    var svg = d3.select("#lineDiv").append("svg").attr("id","svgLine")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                      .append("g").attr("id", "g_svgLine")  
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                      svg.append("g")
                          .attr("class", "x axis").attr("id","xAxis")
                          .attr("transform", "translate(0," + height + ")")
                          .call(xAxis);

                    svg.append("text")
                    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom ) + ")")
                    .style("text-anchor", "middle")
                    .style("font-size", "20px")
                    .style("font-weight", "bold")
                    //.style("text-decoration", "underline")
                    .text("Time");

                      svg.append("g")
                          .attr("class", "y axis")
                          .call(yAxis);
                    
                    svg.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 0 - margin.left + 20)
                    .attr("x",0 - (height / 2))
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .style("font-size", "20px")
                    .style("font-weight", "bold")
                    //.style("text-decoration", "underline")
                    .text("Death Count");

                    CreateLine("Cancer", xScale, yScale, 'blue');
                    CreateLine("Heart Disease", xScale, yScale, 'red');
                    CreateLine("Unintentional Injury", xScale, yScale, 'green');
                    CreateLine("Chronic Lower Respiratory Disease", xScale, yScale, 'orange');
                    CreateLine("Stroke", xScale, yScale, 'purple'); 
                    
                    CreateLegends(width);
                    AddLinesNarrative();
                   
                }

                function CreateLine(cause, xScale, yScale, color)
                {
                    var data = getTotals(cause);
                    
                   var svg = d3.select("#g_svgLine");
                    
                     // Define the line
                    var valueline = d3.svg.line()
                    .x(function(d) { return xScale(d.Year); })
                    .y(function(d) { return yScale(d.DeathCount); });
                  
                    
                    svg.append("path")
                    .attr("class", "line").attr("id", cause)
                    .attr("d", valueline(data))
                    //.attr("data-legend",function(d) { return d.DeathCause })
                    .attr('stroke', color)
                    .attr('stroke-width', 2)
                    .attr('fill', 'none');
                    
                    svg.append("path")
                    //.attr("class", "line")
                    .attr("id", "hidden_" + cause)
                    .attr("d", valueline(data))
                    //.attr("data-legend",function(d) { return d.DeathCause })
                    .attr('stroke', "transparent")
                    .attr("cursor", "pointer")
                    .style("cursor", "pointer")
                    .attr('stroke-width', 20)
                    .attr('fill', 'none')
                    .on("mouseover", function(d,i) {
                        var closestPath = getClosestPath(d3.mouse(this));
                        var year = Math.round(xScale.invert(d3.mouse(this)[0]));
                        var deathCount = Math.round(yScale.invert(d3.mouse(this)[1]));
                        //var selectedCause = d3.select(this).attr("id").substr(7);
                        var selectedCause = d3.select(closestPath).attr("id");
                        CreateToolTip(d3.event, "Year: " + year + "</br>Count: " + deathCount  + "</br>Cause: " + selectedCause);
                        //var color = d3.select("[id='" + selectedCause + "']").attr("stroke"); 
                        //ControlLinesAppearance(selectedCause);
                        //CreateXLabel( true, year, d3.select(this).node(), color);
                    })
                    .on("mouseout", function() { RemoveToolTip(); })
                    .on("click", function() { 
                        var closestPath = getClosestPath(d3.mouse(this));
                        var year = Math.round(xScale.invert(d3.mouse(this)[0]));
                        //var selectedCause = d3.select(this).attr("id").substr(7);
                        var selectedCause = d3.select(closestPath).attr("id");
                        ControlLinesAppearance(selectedCause);
                        CreateTreeMap(selectedCause, year);
                        var color = d3.select("[id='" + selectedCause + "']").attr("stroke"); 
                        CreateXLabel( true, year, d3.select(this).node(), color);
                        /*CreateToolTip(d3.event, "year is " + year + " and death cause is " + selectedCause.attr("id").substr(7));*/
                    });
                    
                    return;
                }

                

                function getClosestPoint(pathNode, point)
                {
                  var pathLength = pathNode.getTotalLength(),
                      precision = 8,
                      best,
                      bestLength,
                      bestDistance = Infinity;

                  // linear scan for coarse approximation
                  for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
                    if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
                      best = scan, bestLength = scanLength, bestDistance = scanDistance;
                    }
                  }

                  // binary search for precise estimate
                  precision /= 2;
                  while (precision > 0.5) {
                    var before,
                        after,
                        beforeLength,
                        afterLength,
                        beforeDistance,
                        afterDistance;
                    if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
                      best = before, bestLength = beforeLength, bestDistance = beforeDistance;
                    } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
                      best = after, bestLength = afterLength, bestDistance = afterDistance;
                    } else {
                      precision /= 2;
                    }
                  }

                  best = [best.x, best.y];
                  best.distance = Math.sqrt(bestDistance);
                  return best;
                    
                    function distance2(p) 
                    {
                        var dx = p.x - point[0],
                            dy = p.y - point[1];
                        return dx * dx + dy * dy;
                    }

                }

                function getClosestPath(point)
                {
                    var closestPath;
                    var closestDistance = Infinity;
                    d3.selectAll("path.line").each(function(d, i) 
                   {
                        var p = getClosestPoint(d3.select(this).node(), point);
                        var pathDistance = Math.sqrt( Math.pow(point[0] - p[0], 2) +  Math.pow(point[1] - p[1], 2));
                        if( pathDistance < closestDistance)
                            {
                                closestPath = d3.select(this).node();
                                closestDistance = pathDistance;
                            }
                   });
                    
                    return closestPath;
                }

                function CreateXLabel(draw, year, path, color)
                {
                    var svg = d3.select("#g_svgLine");
                    svg.select("#linesYearLabel1").remove();
                    svg.select("#linesYearLabel2").remove();
                    svg.select("#linesYearLabel").remove();
                    
                    d3.select("#xAxis").selectAll('.tick')
                    .each(function(d, i) { 
                        d3.select(this)
                            .selectAll('text')
                            .style("fill", "black");
                            //.style("text-decoration","underline")
                            //.style("cursor", "pointer");
                    });
                    
                    if(!draw)
                        return;
                   
                    var x =  (( year - 2005 ) * (width / 10));
                    var y = path.getPointAtLength(x).y;
                    
                    svg.append("line").attr("id","linesYearLabel1")        
                    .style("stroke", "black") 
                    .style("font-weight", "bold")
                    .attr("x1", x + 5)    
                    .attr("y1", y - 5)     
                    .attr("x2", x - 5)     
                    .attr("y2", y + 5);
                    
                     svg.append("line").attr("id","linesYearLabel2")        
                    .style("stroke", "black") 
                    .style("font-weight", "bold")
                    .attr("x1", x - 5)    
                    .attr("y1", y - 5)     
                    .attr("x2", x + 5)     
                    .attr("y2", y + 5);
                    
                     svg.append("line").attr("id","linesYearLabel")        
                    .style("stroke", color) 
                    .style("font-weight", "bold").attr('stroke-width', 1)
                    .attr("x1", x )    
                    .attr("y1", y )     
                    .attr("x2", x )     
                    .attr("y2", height);
                    
                    d3.select("#xAxis").selectAll('.tick')
                    .each(function(d, i) {
                    if(d == year) {
                        /*d3.select(this).append('text').text("Selected")
                            .attr({"text-anchor": "middle",dy: 33,"font-size": ".8em"})*/
                        d3.select(this).selectAll('text').style("fill", color);
                    }});
                    
                    /*svg.append("text").attr("id","linesYearLabel")
                    .attr("y", y)
                    .attr("x", y)
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .style("font-size", "20px")
                    .style("font-weight", "bold")
                    .text(year);*/
                }
                
                function CreateLegends()
                {
                     var legend = d3.select("#svgLine").append("g").attr("id", "g_linelegend")
                      .attr("class", "legend")
                        //.attr("x", w - 65)
                        //.attr("y", 50)
                      .attr("height", 100)
                      .attr("width", 100)
                    .attr('transform', 'translate(-20,50)');


                    legend.selectAll('rect')
                      .data(color_hash)
                      .enter()
                      .append("rect")
                      .attr("x", width + 165)
                      .attr("y", function(d, i){ return i *  20;})
                      .attr("id", function(d, i){ return d.Cause + "LegendColor";})
                      .attr("class", "lineLegends")
                      .attr("cursor", "pointer")
                      .attr("width", 10)
                      .attr("height", 10)
                      .style("fill", function(d, i) { 
                        var color = d.Color;
                        return color;
                      })
                        .on("click", function(d, i){
                            ControlLinesAppearance(d.Cause);
                        });

                    legend.selectAll('text')
                      .data(color_hash)
                      .enter()
                      .append("text")
                      .attr("x", width + 180)
                      .attr("y", function(d, i){ return i *  20 + 9;})
                      .attr("id", function(d, i){ return d.Cause + "LegendText";})
                      .attr("class", "lineLegends")
                      .attr("cursor", "pointer")
                      .text(function(d, i) {
                        var text = d.Cause;
                        return text;
                      })
                        .on("click", function(d, i){
                        ControlLinesAppearance(d.Cause);
                    });
                }

                function ControlLinesAppearance(cause)
                {
                    $("#piechartDiv").empty();
                    $( "#treemapDiv" ).empty();
                    ReflectTreemapParagraphs(false);
                    ReflectPiechartParagraphs(false);
                    CreateXLabel(false);
                    
                    d3.selectAll('path.line').attr("stroke","grey");
                    d3.selectAll("rect.lineLegends").style("fill","grey")
                    .style("stroke-width", 0)
                    .style("font-weight","none").style("text-decoration","none");
                    d3.selectAll("text.lineLegends")//.style("stroke-width", 2)
                    .style("font-weight","normal").style("text-decoration","none");
                    
                    var color = GetCauseColor(cause);
                    d3.select("path[id='" + cause + "']").attr("stroke", color);
                    d3.select("[id='" + cause + "LegendColor']").style("fill", color);
                    d3.select("[id='" + cause + "LegendText']").style("font-weight","bold").style("text-decoration","underline");
                }

                function ReflectTreemapParagraphs(show, cause, year)
                {
                    if(!show)
                    {
                        $("#treemapH").hide();
                    }
                    else
                    {
                        $('#treemapH').show();
                        $('#treemapH').html("States Distribution of <b>" + cause + "</b> in <b>" + year + "</b>");
                    }
                }

                function ReflectPiechartParagraphs(show, cause, year, state)
                {
                      if(!show)
                    {
                        $("#piechartH").hide();
                       
                    }
                    else
                    {
                        $('#piechartH').show();
                        $('#piechartH').html("Locality Distribution of <b>" + cause + "</b> in <b>" + year + "</b> for <b>" + state + "</b>");
                    }
                }

                function CreateToolTip(event, tooltipData)
                {
                    var additional = "";
                    if(!tooltipData.includes("Locality"))
                        additional = "</br></br>Click to know more";
                    
                    tooltipData = tooltipData.replace("Chronic Lower Respiratory Disease", "CLRD");
                     var tooltip = d3.select("#tooltip");
                     tooltip.style("opacity",100).style("left", event.pageX + "px")
                        .style("top", event.pageY + "px").html(tooltipData + additional);
                }

                function RemoveToolTip()
                {
                    var tooltip = d3.select("#tooltip");
                    tooltip.style("opacity",0);
                }

                function treemapPosition() {
                      this.style("left", function(d) { return d.x + "px"; })
                          .style("top", function(d) { return d.y + "px"; })
                          .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
                          .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
                }

                function CreateTreeMap(deathCause, year)
                {
                    //deathCause = deathCause.substr(0, deathCause.length);
                    
                    $( "#treemapDiv" ).empty();
                    $( "#piechartDiv" ).empty();
                    ReflectTreemapParagraphs(true, deathCause, year);
                    ReflectPiechartParagraphs(false);
                    $("#hiddenCause").val(deathCause);
                    $("#hiddenYear").val(year);
                    
                    var deathcauseData = getCauseDeathCounts(deathCause, year);
                    
                    var data = {}
                    data.Code = "tree";
                    data.children = deathcauseData;

                    var width = 870,//innerWidth-40,
                    height = 600, //innerHeight-40,
                    color = d3.scale.category20c(),
                    div = d3.select("#treemapDiv").style("position", "relative");
                    
                    var c20 = d3.scale.category20();
                    var c20b = d3.scale.category20b();
                    var c20c = d3.scale.category20c();
                    
                    var treemap = d3.layout.treemap()//.title("States Distribution")
                        .size([width, height])
                        .sticky(true)
                        .value(function(d) { return d.DeathCount; })
                        .sort(function(a, b) {
                          return a.DeathCount - b.DeathCount;
                        });

                    var node = div.datum(data).selectAll(".node")
                          .data(treemap.nodes)
                        .enter().append("div")
                        .attr("class", "node")
                        .call(treemapPosition)
                          .style("background-color", function(d, i) {
                              return d.Code == 'tree' ? '#fff' : i % 2 == 0 ? color (i) : i % 3 == 0 ? c20c(i) : c20(i); })
                         .on("mouseover", function(d,i) 
                              {
                                CreateToolTip(d3.event, "State: " + d.State + "</br>Death Count: " + d.DeathCount);
                                d3.select(this).style("cursor", "pointer");
                              })
                          .on("mouseout", function() { 
                              RemoveToolTip(); 
                              d3.select(this).style("cursor", "default");
                          })
                          .on("click", function(d,i) 
                              {
                                CreatePieChart(d.Cause, d.Year, d.Code);
                                //ReflectPiechartParagraphs(true, d.Cause, d.Year, d.State);
                              })  
                          .append('div')//.transition()
                           // .transition()
                            //.duration(1500)
                          .style("font-size", function(d) {
                              // compute font size based on sqrt(area)
                              /*if(d.area < 1000 || d.width < 45)
                                  return 0+'px';*/
                              return getAppropriateFontSize(d.Code,d.dx, d.dy,Math.max(20, 0.18*Math.sqrt(d.area))); })
                            .text(function(d) { return d.children ? null : d.Code; });
                    
                    $('html, body').animate({
                    scrollTop: $("#treemapDiv").offset().top
                        }, 1000);
                    
                    AddTreemapNarrative(deathCause, year);
                }

                function AddLinesNarrative()
                {
                    var s = '<div id="divLinesNarrative" style="position:absolute; top:320px; left:1000px" class="narrative">This line chart shows the top 5 death causes and their  progress over time. As you can see, cancer has always been the highest death cause since 2005. </br>Also, progress of each of them is almost constant over time, however, heart disease has been declining since 2005 and then started recently to increase again. </br></br>You can hover over any point to know the death count for the selected-on death cause and year, and you can click for more information about the distribution over all the US states.</div>';
                    
                    $("#lineDiv").append(s);
                }

                function AddTreemapNarrative(deathCause, year)
                {
                    var text = "This treemap is showing the states distribution for " + deathCause + " in " + year + ". Each state represents a portion of the overall death count happening in that year, and definitely the population is a factor that leads to higher death count.</br></br>You can hover over any state code to know the death count as well as its name, and you can click for more information about the locality distribution for that clicked-on state. ";
                    
                    var s = '<div id="divTreemapNarrative" style="position:absolute; top:20px; left:900px" class="narrative">' + text + '</div>';
                    
                    $("#treemapDiv").append(s);
                }

                function AddPieChartNarrative(deathCause, year, code, data)
                {
                    var metropolitan = data[0].Locality == "Metropolitan" ? data[0].DeathCount : data[1].DeathCount;
                    var nonmetropolitan = data[0].Locality != "Metropolitan" ? data[0].DeathCount : data[1].DeathCount;
                    var metText = "This state is similar to most of states in its locality distribution, metropolitan areas are more populated and thus death count is higher.";
                    
                    var nonmetText = "This state is different than most of the states, non-metropolitan areas are more populated and thus have higher death count.";
                    
                    
                    
                    var statesHash = getStatesObject();
                    var text = "This pie chart is showing the locality distribution of " + deathCause + " for " + statesHash[code] + " in " + year + ".</br></br>";
                    
                    var additionaltext = ( metropolitan > nonmetropolitan ? metText : nonmetText );
                    text = text + additionaltext;
                    
                    var s = '<div id="divPieNarrative" style="position:absolute; top:20px; left:900px" class="narrative">' + text + '</div>';
                    
                    $("#piechartDiv").append(s);
                }

                function CreatePieChart(deathCause, year, code)
                {
                    $( "#piechartDiv" ).empty();
                    addStatesDropdown(code);
                    var statesHash = getStatesObject();
                    ReflectPiechartParagraphs(true, deathCause, year, statesHash[code]);
                    
                    var data = getCauseStateDeathCounts(deathCause, year, code);
                    var w = 600;
                    var h = 400;
                    var r = h/2;
                    var color = d3.scale.category20c();

                    var vis = d3.select("#piechartDiv")
                    //.style("position","relative")
                    .append("svg").attr("id","svgPie")
                    .data([data])
                    .attr("width", w).attr("height", h)
                    .append("g").attr("transform", "translate(" + r + "," + r + ")");
                    
                    var pie = d3.layout.pie().value(function(d){return Number(d.DeathCount);});

                    // declare an arc generator function
                    var arc = d3.svg.arc().outerRadius(r);
                   
                    // select paths, use arc generator to draw
                    var arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g");//.attr("class", "slice");
                    arcs.append("svg:path")
                        .attr("d", function (d) {
                            // log the result of the arc generator to show how cool it is :)
                            return arc(d);
                        })
                     .attr("fill", function(d, i){
                            if(data[i].Locality == "Nonmetropolitan" )
                                return "brown";
                            else
                                return "pink";
                        })
                    .on("mouseover", function(d, i) { CreateToolTip(d3.event, "Locality: " + data[i].Locality + "</br>Death Count: " + data[i].DeathCount); })
                    .on("mouseout", function() { RemoveToolTip(); })
                    .transition().delay(function(d,i) {
                    return i * 500; }).duration(1000)
                    .attrTween('d', function(d) {
                        var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
                        return function(t) {
                            d.endAngle = i(t); 
                            return arc(d)
                            }
                        }); 

                    // add the text
                    arcs.append("svg:text").attr("transform", function(d){
                                d.innerRadius = 0;
                                d.outerRadius = r;
                        return "translate(" + arc.centroid(d) + ")";}).attr("text-anchor", "middle").text( function(d, i) {
                        if(data[i].DeathCount > 0)
                            return data[i].Locality;}
		                  );
                    
                    CreatePieChartLegends();
                    
                    $('html, body').animate({
                    scrollTop: $("#piechartDiv").offset().top
                        }, 1000);
                    
                    AddPieChartNarrative(deathCause, year, code, data);
                }

                function CreatePieChartLegends()
                {
                     var locality_color_hash = [{"Locality":"Metropolitan","Color":"pink"},{"Locality":"Nonmetropolitan","Color":"brown"}];
                    
                     var legend = d3.select("#svgPie").append("g")
                      .attr("class", "legend")
                        //.attr("x", w - 65)
                        //.attr("y", 50)
                      .attr("height", 100)
                      .attr("width", 100)
                    .attr('transform', 'translate(-20,50)');


                    legend.selectAll('rect')
                      .data(locality_color_hash)
                      .enter()
                      .append("rect")
                      .attr("x", 500)
                      .attr("y", function(d, i){ return i *  20;})
                      //.attr("id", function(d, i){ return d.Cause + "LegendColor";})
                      .attr("class", "lineLegends")
                      .attr("width", 10)
                      .attr("height", 10)
                      .style("fill", function(d, i) { 
                        var color = d.Color;
                        return color;
                      });

                    legend.selectAll('text')
                      .data(locality_color_hash)
                      .enter()
                      .append("text")
                      .attr("x", 530)
                      .attr("y", function(d, i){ return i *  20 + 9;})
                      //.attr("id", function(d, i){ return d.Cause + "LegendText";})
                      .attr("class", "lineLegends")
                      .text(function(d, i) {
                        var text = d.Locality;
                        return text;
                      });
                       
                
                }

                function testNodeDimension(fontSize, text, boxWidth, boxHeight)
                {
                    var test = $("#Test");
                    test.css("fontSize", fontSize);
                    test.html(text);
                    var height = (test.height() + 1);
                    var width = (test.width() + 1);
                    if(height <= boxHeight && width <= boxWidth)
                        return true;
                    return false;
                }

                function getAppropriateFontSize(text, boxWidth, boxHeight, startFontSize)
                {
                    for(var i = startFontSize; i >= 12; i--)
                        {
                          var valid = testNodeDimension(i,text, boxWidth, boxHeight);
                          if(valid)
                              return i + 'px';
                        }
                         return '0px';   
                }

                function addStatesDropdown(selectedState) 
                {
                    var s = '<div id="divStates" style="position:absolute; top:40px; left:650px"><select class="selectpicker" id="dropdownStates">';

                    var data = states.sort(function(a, b) {
                     if ((typeof a.Name === 'undefined' && typeof b.Name !== 'undefined') || a.Name[0] < b.Name[0]) 
                         return -1;
                     if ((typeof b.Name === 'undefined' && typeof a.Name !== 'undefined') || a.Name[0] > b.Name[0]) 
                         return 1;

                        return 0;
                    });
                    
                    for(var i in data)
                    {
                        var selectedText = "";
                        if(data[i].Code == selectedState)
                            selectedText = 'selected="selected"';
                        s = s + '<option value="' + data[i].Code + '" ' + selectedText + '>' + data[i].Name + '</option>';
                    }
                    
                    s = s + "</select></div>";
                    
                    $('#piechartDiv').append(s);
                    
                    $('#divStates').change(function() {
                        var val = $("#dropdownStates option:selected").val();
                        CreatePieChart( $("#hiddenCause")[0].value,  $("#hiddenYear")[0].value, val);
                        //alert(val);
                    });
                }            