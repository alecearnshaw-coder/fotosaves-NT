// Helper function to construct Location_Date string from component fields
function buildLocationDateString(item) {
    const date = (item.Date || '').slice(0, 10);
    const location = item.Location || '';
    const province = item.Province || '';
    let country = '';
    if (item.Country && item.Country.trim() && item.Country !== 'Argentina') {
        country = ', ' + item.Country.toUpperCase();
    }
    return location + ', ' + province + country + ' - ' + date;
}

