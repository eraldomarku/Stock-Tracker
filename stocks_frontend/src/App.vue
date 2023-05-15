<template>
  <div id="app">
    <div class="container">
      <div class="left">
        <h2>Stock</h2>
        <ul class="stocks-list">
          <li v-for="stock in stocks" :key="stock.id">
            <input
              type="checkbox"
              :id="stock.id"
              :value="stock"
              :disabled="selectedStocks.length >= 3 && !stock.selected"
              v-model="stock.selected"
              @change="handleStockSelection(stock)"
            />
            <label :for="stock.id">{{ stock.name }}</label>
          </li>
        </ul>
      </div>
      <div class="main">
        <h1>Chart</h1>
        <canvas id="line-chart"></canvas>
        <div id="legend-container"></div>
      </div>
      <div class="right">
    <h2>Statistics</h2>
    <div v-for="stock in selectedStocks" :key="stock.id">
      <h3>{{ stock.name }}</h3>
      <p>Annualized Return: {{ toFixed(stock.annualized_return, 3) }}</p>
      <p>Annualized Volatility: {{ toFixed(stock.annualized_volatility, 3) }}</p>
      <p>Cumulative Return: {{ toFixed(stock.cumulative_return, 3) }}</p>
    </div>
  </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from 'chart.js';

export default {
  data() {
    return {
      stocks: [
        { id: 1, name: 'Apple', selected: false, symbol: 'AAPL', color: '' },
        { id: 2, name: 'Microsoft', selected: false, symbol: 'MSFT', color: '' },
        { id: 3, name: 'Google', selected: false, symbol: 'GOOGL', color: '' },
        { id: 4, name: 'Amazon', selected: false, symbol: 'AMZN', color: '' },
        { id: 5, name: 'Facebook', selected: false, symbol: 'FB', color: '' },
        { id: 6, name: 'MSP Recovery', selected: false, symbol: 'LIFW', color: '' },
      ],
      stock: {
        symbol: '',
        annualized_return: null,
        annualized_volatility: null,
        cumulative_return: null,
        dates: [],
        normalized_prices: [],
      },
      chart: null,
    };
  },
  computed: {
    selectedStocks() {
      return this.stocks.filter(stock => stock.selected);
    },
  },
  methods: {
    async fetchStockData(symbol) {
      try {
        const response = await axios.get(
          `https://flask-production-78c6.up.railway.app/api/stocks/${symbol}`
        );
        this.stock = response.data;
        return this.stock;
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    },
    initChart() {
  Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale
  );

  // If a chart instance already exists, destroy it.
  if (this.chart) {
    this.chart.destroy();
  }

  const ctx = document.getElementById('line-chart').getContext('2d');
  // Assign the new chart instance to the `chart` property.
  this.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: this.stock.dates,
      datasets: [
        {
          label: this.stock.symbol,
          data: this.stock.normalized_prices,
          backgroundColor: 'rgba(255, 0, 9, 0.2)',
          borderColor: 'rgba(5, 139, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          min: 0,
        },
      },
    },
  });
},
async handleStockSelection(stock) {
  if (this.selectedStocks.length > 3) {
    this.selectedStocks[0].selected = false;
  }
  if (stock.selected) {
    const fetchedStockData = await this.fetchStockData(stock.symbol);
    Object.assign(stock, fetchedStockData);
    this.displayStockStatistics(stock); // Call the new method here
    this.updateChart(stock);
  } else {
    this.removeChartDataset(stock);
  }
},

displayStockStatistics(stock) {
  this.$set(this.stocks, this.stocks.findIndex(s => s.id === stock.id), stock);
},

toFixed(value, decimals) {
    return parseFloat(value).toFixed(decimals);
  },

updateChart(stock) {
  const color = this.getRandomColor();
  stock.color = color; // Store the color in the stock object
  
  const dataset = {
    label: stock.symbol,
    data: this.stock.normalized_prices,
    borderColor: color,
    borderWidth: 1,
    fill: false,
  };

  this.chart.data.labels = this.stock.dates;
  this.chart.data.datasets.push(dataset);
  this.chart.update();

  this.addLegendItem(stock); // Call the new method to add legend item
},

removeChartDataset(stock) {
  const index = this.chart.data.datasets.findIndex(
    (dataset) => dataset.label === stock.symbol
  );

  if (index !== -1) {
    this.chart.data.datasets.splice(index, 1);
    this.chart.update();
  }

  this.removeLegendItem(stock); // Call the new method to remove legend item
},

addLegendItem(stock) {
  const legendContainer = document.getElementById('legend-container');
  const legendItem = document.createElement('div');
  const colorBox = document.createElement('span');
  const nameLabel = document.createElement('span');

  colorBox.style.backgroundColor = stock.color;
  colorBox.style.display = 'inline-block';
  colorBox.style.width = '12px';
  colorBox.style.height = '12px';
  colorBox.style.marginRight = '8px';

  nameLabel.textContent = stock.name;

  legendItem.appendChild(colorBox);
  legendItem.appendChild(nameLabel);
  legendItem.id = `legend-item-${stock.id}`;

  legendContainer.appendChild(legendItem);
},

removeLegendItem(stock) {
  const legendContainer = document.getElementById('legend-container');
  const legendItem = document.getElementById(`legend-item-${stock.id}`);

  if (legendItem) {
    legendContainer.removeChild(legendItem);
  }
},



getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
},},
mounted() {
this.initChart();
},
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

#app {
  font-family: 'Roboto', sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: calc(100vh - 60px);
  padding: 20px;
  box-sizing: border-box;
}

.left,
.right {
  width: 20%;
  background-color: #B0B2FF;
  padding: 20px;
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
}

.main {
  width: 60%;
  background-color: #ffffff;
  padding: 20px;
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  margin: 0 20px;
}

h1, h2 {
  font-weight: 700;
  margin-bottom: 20px;
}

p {
  font-weight: 300;
  line-height: 1.6;
}

.stocks-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  font-size: 1.2em;
  text-align: left;
}

.stocks-list li {
  margin-bottom: 10px;
}
</style>