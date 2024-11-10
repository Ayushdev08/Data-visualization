document.addEventListener('DOMContentLoaded', () => {
    const companyList = document.getElementById('company-list');
    const searchBox = document.getElementById('search-box');
    const sortOptions = document.getElementById('sort-options'); // Reference to the sort dropdown
    const filterButton = document.getElementById('filter-button'); // Reference to the filter button
    const ctx = document.getElementById('company-chart').getContext('2d');
    let chart;
    let companiesData = {};
    const loader = document.getElementById('loader'); // Reference to the loader

    // Fetch CSV data
    loader.style.display = 'block'; // Show loader before fetching data
    fetch('modified_dump.csv')
        .then(response => response.text())
        .then(data => {
            companiesData = parseCSV(data);
            populateCompanyList(companiesData);
            loader.style.display = 'none'; // Hide loader after data is loaded
        })
        .catch(error => {
            console.error('Error fetching the CSV data:', error);
            loader.style.display = 'none'; // Hide loader if there's an error
        });

    function parseCSV(data) {
        const lines = data.split('\n').slice(1);
        const companies = {};
        
        lines.forEach(line => {
            const [name, value] = line.split(',');
            if (name && value) {
                if (!companies[name]) {
                    companies[name] = [];
                }
                companies[name].push(parseFloat(value));
            }
        });
        return companies;
    }

    function populateCompanyList(companies) {
        companyList.innerHTML = ''; // Clear existing list
        for (const company in companies) {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = company;
            li.onclick = () => displayChart(companies[company], company);
            companyList.appendChild(li);
        }
    }

    function displayChart(data, companyName) {
        if (chart) {
            chart.destroy();
        }
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((_, index) => index + 1),
                datasets: [{
                    label: companyName,
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1 // Smooth line
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return `Value: ${tooltipItem.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    document.getElementById('dark-mode-toggle').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });

    // Search functionality
    searchBox.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredCompanies = Object.keys(companiesData).filter(company => 
            company.toLowerCase().includes(searchTerm)
        );
        populateCompanyList(Object.fromEntries(filteredCompanies.map(company => [company, companiesData[company]])));
    });

    // Sort functionality
    sortOptions.addEventListener('change', function() {
        const sortOption = this.value;
        let sortedCompanies;

        if (sortOption === 'alphabetical') {
            sortedCompanies = Object.keys(companiesData).sort();
        } else if (sortOption === 'value-asc') {
            sortedCompanies = Object.keys(companiesData).sort((a, b) => {
                return Math.min(...companiesData[a]) - Math.min(...companiesData[b]);
            });
        } else if (sortOption === 'value-desc') {
            sortedCompanies = Object.keys(companiesData).sort((a, b) => {
                return Math.max(...companiesData[b]) - Math.max(...companiesData[a]);
            });
        }

        populateCompanyList(Object.fromEntries(sortedCompanies.map(company => [company, companiesData[company]])));
    });

    // Filter functionality (example: filter companies with values above a certain threshold)
    filterButton.addEventListener('click', function() {
        const threshold = 10; // Example threshold value
        const filteredCompanies = Object.keys(companiesData).filter(company => 
            companiesData[company].some(value => value > threshold)
        );
        populateCompanyList(Object.fromEntries(filteredCompanies.map(company => [company, companiesData[company]])));
    });
}); 