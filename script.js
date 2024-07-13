// Chart setup source code taken from https://d3js.org/getting-started#d3-in-vanilla-html

// Declare the chart dimensions and margins.
const width = 840;
const height = 400;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;

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

svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(yScale));

///

d3.csv("data/presidential_polls_cleaned.csv")
    .then(data => {
        data.forEach(d => {
            console.log(d.Date);
            d.Date = parseTime(d.Date);
            d.AverageScore = +d.AverageScore;
        });

        console.log(data);

        const candidates = d3.groups(data, d => d.Candidate);

        const colors = ["#244DC7", "#C11D1D", "#383838"];

        const colorScale = d3.scaleOrdinal()
            .domain(candidates.map(d => d[0]))
            .range(colors);

        console.log(candidates);

        // Source for curve: https://benclinkinbeard.com/d3tips/creating-svg-paths-with-d3line/
        const line = d3.line()
            .x(d => xScale(d.Date))
            .y(d => yScale(d.AverageScore))
            .curve(d3.curveCatmullRom.alpha(0.5));

        console.log(line);

        candidates.forEach(([candidate, values]) => {
            svg.append("path")
                .datum(values)
                .attr("fill", "none")
                .attr("stroke", colorScale(candidate))
                .attr("stroke-width", 3)
                .attr("d", line);
        });
    });

///

chart.append(svg.node());
