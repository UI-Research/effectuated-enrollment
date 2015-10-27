var MOBILE_THRESHOLD = 700;
var main_data_url = "data/percents.csv";
var isMobile = false;
var VAL,
    NUMTICKS;
var $legend = $('#legend');
var $graphic = $('#graphic');
var barchart_aspect_width = 1;
var BREAKS = [0, 2, 1];
var COLORS = ["#000", "#00578b", "#46abdb"];
var LABELS = ["State-based marketplace", "State-based using healthcare.gov", "Federally facilitated marketplace"]
var FORMATTER = d3.format("%");
var numticks = 6;

function barchart(container_width) {

    var color = d3.scale.ordinal()
        .domain(BREAKS)
        .range(COLORS);

    data.sort(function (a, b) {
        return a[VAL] - b[VAL];
    });

    data.forEach(function (d) {
        d[VAL] = +d[VAL];
    });


    if (container_width == undefined || isNaN(container_width)) {
        container_width = 1170;
    }

    //vertical bar chart on mobile
    if (container_width < MOBILE_THRESHOLD) {
        var barchart_aspect_height = 2.4;
        var margin = {
            top: 25,
            right: 15,
            bottom: 25,
            left: 25
        };

        var width = container_width - margin.left - margin.right,
            height = Math.ceil((width * barchart_aspect_height) / barchart_aspect_width) - margin.top - margin.bottom;

        $graphic.empty();

        var svg = d3.select("#graphic").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var y = d3.scale.ordinal()
            .rangeRoundBands([height, 0], .2)
            .domain(data.map(function (d) {
                return d.abbrev;
            }));

        var x = d3.scale.linear()
            .range([0, width])
            .domain(d3.extent(data, function (d) {
                return d[VAL];
            }));

        var yAxis = d3.svg.axis()
            .scale(y)
            .tickSize(0)
            .orient("left");

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(height)
            .tickFormat(FORMATTER)
            .ticks(5)
            .orient("top");

        /*        var gy = svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);*/

        var gx = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x axis")
            .call(xAxis);

        gx.selectAll("g").filter(function (d) {
                return d;
            })
            .classed("minor", true);

        var neglabels = svg.selectAll("g.neglabels")
            .data(data)
            .enter().append("g")
            .attr("class", "abbrevs");

        neglabels.append("text")
            .attr('id', function (d) {
                return "v" + d.abbrev;
            })
            .attr("y", function (d) {
                return 0.8 * y.rangeBand() + y(d.abbrev);
            })
            .attr("x", function (d) {
                return x(0) - (15 * (Math.abs(d[VAL])) / d[VAL]) - 5;
            })
            .text(function (d) {
                return d.abbrev;
            });

        var pctbar = svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("g");

        pctbar.append("rect")
            .attr('id', function (d) {
                return d.abbrev;
            })
            .attr("fill", function (d) {
                return color(d.ffm);
            })
            .attr("class", "bar")
            .attr("x", function (d) {
                return Math.min(x(d[VAL]), x(0));
            })
            .attr("width", function (d) {
                return Math.abs(x(0) - (x(d[VAL])));
            })
            .attr("y", function (d) {
                return y(d.abbrev);
            })
            .attr("height", y.rangeBand());
        /*            .on("click", function (d) {
                        dispatch.clickState(this.id);
                    })
                    .on("mouseover", function (d) {
                        if (isIE != false) {
                            d3.selectAll(".hovered")
                                .classed("hovered", false);
                            d3.selectAll("#" + this.id)
                                .classed("hovered", true)
                                .moveToFront();
                            tooltip(this.id);
                            this.parentNode.appendChild(this);
                            console.log("I'm using the worst browser test4");
                        } else {
                            dispatch.hoverState(this.id);
                        }
                    })
                    .on("mouseout", function (d) {
                        dispatch.dehoverState(this.id);
                    });*/

        //manual line for axis at 0
        svg.append("g")
            .append("line")
            .attr("class", "zeroline")
            .attr("x1", function (d) {
                return x(0);
            })
            .attr("x2", function (d) {
                return x(0);
            })
            .attr("y1", height)
            .attr("y2", 0);

    } else {
        var barchart_aspect_height = 0.3;
        var margin = {
            top: 15,
            right: 15,
            bottom: 25,
            left: 35
        };

        var width = container_width - margin.left - margin.right,
            height = Math.ceil((width * barchart_aspect_height) / barchart_aspect_width) - margin.top - margin.bottom;

        $graphic.empty();

        var svg = d3.select("#graphic").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1)
            .domain(data.map(function (d) {
                return d.abbrev;
            }));

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(0)
            .orient("bottom")

        var y = d3.scale.linear()
            .range([height, 0]);

        var ymin = d3.min(data, function (d) {
            return d[VAL];
        });

        if (ymin >= 0) {
            y.domain([0, d3.max(data, function (d) {
                return d[VAL];
            })]);
        } else {
            y.domain(d3.extent(data, function (d) {
                return d[VAL];
            }));
        }

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickFormat(FORMATTER)
            .ticks(numticks)
            .tickSize(-width);

        var gy = svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        gy.selectAll("g").filter(function (d) {
                return d;
            })
            .classed("minor", true);

        gy.selectAll("text")
            .attr("x", -4)
            .attr("dy", 4);

        var neglabels = svg.selectAll("g.neglabels")
            .data(data)
            .enter().append("g")
            .attr("class", "abbrevs");

        neglabels.append("text")
            .attr("text-anchor", "middle")
            .attr("x", function (d) {
                return x(d.abbrev) + 0.5 * x.rangeBand();
            })
            .attr("y", function (d) {
                return y(0) + (10 * (Math.abs(d[VAL])) / d[VAL]) + 2;
            })
            .text(function (d) {
                return d.abbrev;
            });

        var pctbar = svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("g");

        pctbar.append("rect")
            .attr('id', function (d) {
                return d.abbrev;
            })
            .attr("fill", function (d) {
                return color(d.ffm);
            })
            .attr("class", "bar")
            .attr("x", function (d) {
                return x(d.abbrev);
            })
            .attr("width", x.rangeBand())
            .attr("y", function (d) {
                return Math.min(y(d[VAL]), y(0));
            })
            .attr("height", function (d) {
                return Math.abs(y(0) - (y(d[VAL])));
            });
        /*            .on("click", function (d) {
                        dispatch.clickState(this.id);
                    })
                    .on("mouseover", function (d) {
                        if (isIE != false) {
                            d3.selectAll(".hovered")
                                .classed("hovered", false);
                            d3.selectAll("#" + this.id)
                                .classed("hovered", true)
                                .moveToFront();
                            tooltip(this.id);
                            this.parentNode.appendChild(this);
                        } else {
                            dispatch.hoverState(this.id);
                        }
                    })
                    .on("mouseout", function (d) {
                        dispatch.dehoverState(this.id);
                    });*/


        //manual line for axis at 0
        svg.append("g")
            .append("line")
            .attr("class", "zeroline")
            .attr("y1", function (d) {
                return y(0);
            })
            .attr("y2", function (d) {
                return y(0);
            })
            .attr("x1", 0)
            .attr("x2", width);
    }
    if (VAL == "eselect") {
        function legend() {
            //draw a legend

            if (container_width < MOBILE_THRESHOLD) {
                var margin = {
                    top: 3,
                    right: 1,
                    bottom: 5,
                    left: 1
                };

                var width = container_width - margin.left - margin.right,
                    height = 100 - margin.top - margin.bottom;

                $legend.empty();

                var svg = d3.select("#legend").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var lp_w = 200,
                    ls_w = 30,
                    ls_h = 15;

                var legend = svg.selectAll("g.legend")
                    .data(LABELS)
                    .enter().append("g")
                    .attr("class", "legend");

                legend.append("text")
                    .data(LABELS)
                    .attr("y", function (d, i) {
                        return (i * 25) + 13;
                    })
                    .attr("x", ls_w + 15)
                    .text(function (d, i) {
                        return d;
                    });

                legend.append("rect")
                    .data(COLORS)
                    .attr("y", function (d, i) {
                        return (i * 25);
                    })
                    .attr("x", 10)
                    .attr("width", ls_w)
                    .attr("height", ls_h)
                    .style("fill", function (d, i) {
                        return COLORS[i];
                    })
            } else {
                var margin = {
                    top: 3,
                    right: 1,
                    bottom: 5,
                    left: 1
                };

                var width = container_width - margin.left - margin.right,
                    height = 30 - margin.top - margin.bottom;

                $legend.empty();

                var svg = d3.select("#legend").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var lp_w = 200,
                    ls_w = 30,
                    ls_h = 15;

                var legend = svg.selectAll("g.legend")
                    .data(LABELS)
                    .enter().append("g")
                    .attr("class", "legend");

                legend.append("text")
                    .data(LABELS)
                    .attr("x", function (d, i) {
                        return (i * (ls_w + lp_w)) + ls_w + 5;
                    })
                    .attr("y", 22)
                    .text(function (d, i) {
                        return d;
                    });

                legend.append("rect")
                    .data(COLORS)
                    .attr("x", function (d, i) {
                        return (i * (ls_w + lp_w));
                    })
                    .attr("y", 10)
                    .attr("width", ls_w)
                    .attr("height", ls_h)
                    .style("fill", function (d, i) {
                        return COLORS[i];
                    })
            }
        }
        legend();
    }
}