import { AnalyticsService } from '../services/analytics-service.js';

export class ChartRenderer {
    static async renderChart(canvasId, chartType, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element with id ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        
        // Default options
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        borderDash: [2, 2]
                    }
                }
            }
        };

        const chartOptions = { ...defaultOptions, ...options };

        // Destroy existing chart if it exists
        if (canvas.chart) {
            canvas.chart.destroy();
        }

        // Create new chart
        canvas.chart = new Chart(ctx, {
            type: chartType,
            data: data,
            options: chartOptions
        });

        return canvas.chart;
    }

    static async renderPropertyViewsChart(canvasId, propertyId, period = '30d') {
        try {
            const analytics = await AnalyticsService.getPropertyAnalytics(propertyId, period);
            const chartData = AnalyticsService.prepareChartData(analytics.views_data, 'line');
            
            return this.renderChart(canvasId, 'line', chartData, {
                plugins: {
                    title: {
                        display: true,
                        text: 'Property Views'
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering property views chart:', error);
            this.showChartError(canvasId, 'Error loading views data');
        }
    }

    static async renderRevenueChart(canvasId, userId, userRole, period = '30d') {
        try {
            const analytics = await AnalyticsService.getUserAnalytics(userId, userRole, period);
            const chartData = AnalyticsService.prepareChartData(analytics.payments_data, 'line');
            
            return this.renderChart(canvasId, 'line', chartData, {
                plugins: {
                    title: {
                        display: true,
                        text: 'Revenue Trend'
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering revenue chart:', error);
            this.showChartError(canvasId, 'Error loading revenue data');
        }
    }

    static async renderUserStatsChart(canvasId, period = '30d') {
        try {
            const analytics = await AnalyticsService.getAdminAnalytics(period);
            const chartData = AnalyticsService.prepareChartData(analytics.user_stats, 'pie');
            
            return this.renderChart(canvasId, 'pie', chartData, {
                plugins: {
                    title: {
                        display: true,
                        text: 'User Distribution'
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering user stats chart:', error);
            this.showChartError(canvasId, 'Error loading user data');
        }
    }

    static async renderBookingActivityChart(canvasId, period = '30d') {
        try {
            const analytics = await AnalyticsService.getAdminAnalytics(period);
            const chartData = AnalyticsService.prepareChartData(analytics.bookings_data, 'bar');
            
            return this.renderChart(canvasId, 'bar', chartData, {
                plugins: {
                    title: {
                        display: true,
                        text: 'Booking Activity'
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering booking activity chart:', error);
            this.showChartError(canvasId, 'Error loading booking data');
        }
    }

    static showChartError(canvasId, message) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const container = canvas.parentElement;
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-500">
                <i class="fas fa-chart-line text-4xl mb-2 text-gray-300"></i>
                <p>${message}</p>
            </div>
        `;
    }

    static createChartContainer(id, title, height = '300px') {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="font-bold">${title}</h3>
                </div>
                <div class="card-body">
                    <div class="chart-container" style="height: ${height}; position: relative;">
                        <canvas id="${id}"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    // Utility method to update chart data
    static updateChartData(chart, newData, newLabels = null) {
        if (!chart) return;

        chart.data.datasets[0].data = newData;
        
        if (newLabels) {
            chart.data.labels = newLabels;
        }
        
        chart.update();
    }

    // Method to create a simple bar chart
    static createBarChart(canvasId, data, options = {}) {
        const defaultData = {
            labels: data.labels || [],
            datasets: [{
                label: options.label || 'Data',
                data: data.values || [],
                backgroundColor: options.backgroundColor || '#3b82f6',
                borderColor: options.borderColor || '#3b82f6',
                borderWidth: 1
            }]
        };

        return this.renderChart(canvasId, 'bar', defaultData, options);
    }

    // Method to create a simple line chart
    static createLineChart(canvasId, data, options = {}) {
        const defaultData = {
            labels: data.labels || [],
            datasets: [{
                label: options.label || 'Data',
                data: data.values || [],
                borderColor: options.borderColor || '#3b82f6',
                backgroundColor: options.backgroundColor || 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };

        return this.renderChart(canvasId, 'line', defaultData, options);
    }

    // Method to create a simple pie chart
    static createPieChart(canvasId, data, options = {}) {
        const defaultData = {
            labels: data.labels || [],
            datasets: [{
                data: data.values || [],
                backgroundColor: options.backgroundColor || [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                ]
            }]
        };

        return this.renderChart(canvasId, 'pie', defaultData, options);
    }
}