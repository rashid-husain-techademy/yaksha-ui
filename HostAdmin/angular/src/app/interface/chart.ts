import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexNonAxisChartSeries, ApexPlotOptions, ApexResponsive, ApexStroke, ApexTheme, ApexTooltip, ApexXAxis, ApexYAxis } from "ng-apexcharts";

export type TestTakerChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    stroke: any;
    theme: ApexTheme;
    tooltip: ApexTooltip;
    dataLabels: ApexDataLabels;
    legend: ApexLegend;
    colors: string[];
    markers: any;
    grid: ApexGrid;
    fill: ApexFill;
};

export interface UserChartOptions {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    stroke: ApexStroke;
    dataLabels: ApexDataLabels;
    legends: ApexLegend;
    labels: any;
    name: any;
    tooltip: ApexTooltip;
    colors: string[];
    plotOptions: ApexPlotOptions
}

export type StackReportChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    xaxis: ApexXAxis;
    fill: ApexFill;
    tooltip: ApexTooltip;
    stroke: ApexStroke;
    legend: ApexLegend;
};

export type AssignedAssessmentChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    stroke: any;
    theme: ApexTheme;
    tooltip: ApexTooltip;
    dataLabels: ApexDataLabels;
    legend: ApexLegend;
    colors: string[];
    markers: any;
    grid: ApexGrid;
}

export type AssessmentReviewProgressChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    plotOptions: ApexPlotOptions;
    fill: ApexFill;
    stroke: ApexStroke;
};

export type AssessmentResultChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    stroke: ApexStroke;
    dataLabels: ApexDataLabels;
    legends: ApexLegend;
    labels: any;
    name: any;
    tooltip: ApexTooltip;
    colors: string[];
    plotOptions: ApexPlotOptions
}

export type QuestionReviewerChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    responsive: ApexResponsive[];
    labels: any;
    legend: ApexLegend;
    colors: string[];
    fill: ApexFill;
    dataLabels: ApexDataLabels;
};