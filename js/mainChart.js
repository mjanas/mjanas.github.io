// Chart setup source code taken from https://d3js.org/getting-started#d3-in-vanilla-html

const width = 1000;
const height = 600;
const marginTop = 50;
const marginRight = 50;
const marginBottom = 50;
const marginLeft = 50;

const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");

const xScale = d3.scaleUtc()
    .domain([new Date("2024-01-01"), new Date("2024-07-15")])
    .range([marginLeft, width - marginRight]);

const yScale = d3.scaleLinear()
    .domain([0, 50])
    .range([height - marginBottom, marginTop]);

const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(xScale));

svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", (width - marginLeft - marginRight) / 2 + marginLeft)
    .attr("y", height)
    .text("Date");

svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(yScale));

svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90)`)
    .attr("x", -(height - marginTop - marginBottom) / 2 - marginTop)
    .attr("y", 15)
    .text("Average Poll Score");

var tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip");

var hoverLine = svg.append("line")
    .attr("id", "hoverline")
    .attr("x1", width / 2)
    .attr("x2", width / 2)
    .attr("y1", marginTop)
    .attr("y2", height - marginBottom);

function calculateNearestDate(dates, targetDate) {
    const nearestDate = dates.reduce((previous, current) => {
        const a = Math.abs(current - targetDate);
        const b = Math.abs(previous - targetDate);
        return a < b ? current : previous;
    });

    return nearestDate;
}

function getScoresForDate(array, targetDate) {
    const text = array
        .filter(item => item[0] === targetDate)
        .map(item => item[1])
        .flat()
        .sort((a, b) => b.AverageScore - a.AverageScore)
        .map(item => item.Candidate + ": " + item.AverageScore)
        .join("<br>");
    
    return text;
}

d3.csv("data/polls_aggregated_2024_07_21.csv")
    .then(data => {
        data.forEach(d => {
            d.Date = parseTime(d.Date);
            d.Candidate = d.Candidate;
            d.AverageScore = +d.AverageScore;
        });

        const candidates = d3.groups(data, d => d.Candidate);
        const dates = data.map(i => i.Date);
        const dateGroups = d3.groups(data, d => d.Date);

        const colors = ["#244DC7", "#C11D1D", "#383838", "#652BA3"];

        const colorScale = d3.scaleOrdinal()
            .domain(candidates.map(d => d[0]))
            .range(colors);

        // Source for curve: https://benclinkinbeard.com/d3tips/creating-svg-paths-with-d3line/
        const line = d3.line()
            .x(d => xScale(d.Date))
            .y(d => yScale(d.AverageScore))
            .curve(d3.curveCatmullRom.alpha(0.1));

        candidates.forEach(([candidate, values]) => {
            svg.append("path")
                .datum(values)
                .attr("id", "chartline")
                .attr("stroke", colorScale(candidate))
                .attr("d", line);
        });

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function() {
                tooltip.style("opacity", 1);
            })
            .on("mousemove", function(event) {
                const mouseX = d3.pointer(event, this)[0];
                const xDate = xScale.invert(mouseX);

                const nearestDate = calculateNearestDate(dates, xDate);
                const candidatesAndScores = getScoresForDate(dateGroups, nearestDate);

                tooltip.html(d3.timeFormat("%B %d, %Y")(nearestDate) + "<br><br>" + candidatesAndScores)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");

                hoverLine
                    .attr("x1", mouseX)
                    .attr("x2", mouseX)
                    .attr("y1", marginTop)
                    .attr("y2", height - marginBottom);
            })
            .on("mouseout", function() {
                tooltip.style("opacity", 0);
            });
    });

mainChart.append(svg.node());
