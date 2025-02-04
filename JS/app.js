const ip_input = document.getElementById('ip');
const form = document.getElementById('form');
const ip_out = document.getElementById('ip_addr');
const loc_f = document.getElementById('loc');
const timezone_f = document.getElementById('time');
const isp_f = document.getElementById('isp');
const err_msg = document.getElementById('err');
const spinner = document.querySelector('.spinner');
const info = document.querySelectorAll('.info');
const sep = document.querySelectorAll('.sep')

/*reset all fields*/
const resetFields = () => {
    ip_out.innerText = "-";
    loc_f.innerText = "-";
    timezone_f.innerText = "-";
    isp_f.innerText = "-";
}
//show on map
const showMap = (data) => {

    let lat = data['latitude'];
    let lng = data['longitude'];
    //console.log(data['location'])
    mymap.setView([lat, lng], 13); 
    marker.setLatLng([lat,lng]);
    
};
//fil the fileds up
const fillUp = (data) => {
    const ip = `${data['ip']}`;
    const loc = `${data['city']}, ${data['country_name']} ${data['zipcode']}`;
    const time = `UTC ${data['time_zone']['name']}`;
    const isp = `${data['organization']}`;
    ip_out.innerText = ip;
    loc_f.innerText = loc;
    timezone_f.innerText = time;
    isp_f.innerText = isp;
    if (ip_input.classList.contains('error')) {
        ip_input.classList.remove('error');
        err_msg.classList.remove('show');
    }

}

//Show errors fields
const showError = (err) => {
    ip_input.classList.add('error');
    err_msg.innerText = err.message;
    err_msg.classList.add('show');
}
//spinner stuff
const spinnerHide = () => {
    if (spinner.classList.contains('show')) {
        spinner.classList.remove('show');
        spinner.classList.add('hide');
        info.forEach(i => {
            i.classList.remove('hide');
            i.classList.add('show');
        })
        sep.forEach(s => {
            s.classList.remove('hide');
            s.classList.add('show');
        })
    }
};
const spinnerShow = () => {
    if (spinner.classList.contains('hide')) {
        spinner.classList.remove('hide');
        spinner.classList.add('show');
        info.forEach(i => {
            i.classList.remove('show');
            i.classList.add('hide');
        })
        sep.forEach(s => {
            s.classList.remove('show');
            s.classList.add('hide');
        })
    }
};
//get user IP
const getIp = async () => {
    try {
        // Use the IPv4-specific endpoint
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Failed to fetch public IPv4:', error);
        return null;
      }
}

//Fetching Ip location
const getInfos = async (ipAddr) => {
    let response;
    const ip_regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ip_regex.test(ipAddr)) {
        response = await fetch("https://api.ipgeolocation.io/ipgeo?apiKey=e4d9308b065646d5a67eec90b0a9181d&ip=" + ipAddr,{mode: 'cors'});
    } else {
        response = await fetch("https://api.ipgeolocation.io/ipgeo?apiKey=e4d9308b065646d5a67eec90b0a9181d&ip=" + ipAddr,{mode: 'cors'});
    }

    if (response.status !== 200) {
        throw new Error('Not a valid ip Address / domain');
    }
    const data = await response.json();
    console.log(data);
    return data;
};


//submit listener
form.addEventListener('submit', e => {
    e.preventDefault();
    spinnerShow();
    getInfos(ip_input.value.trim())
        .then(data => {
            fillUp(data);
            spinnerHide();
            showMap(data);
        })
        .catch(e => {
            spinnerHide();
            resetFields();
            showError(e)
        });

})

// show user's ip location
getIp()
    .then(data => {
        getInfos(data['ip'])
        .then(data => {
            fillUp(data);
            spinnerHide();
            showMap(data);

        })
    });


var mymap = L.map('mapid');

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2FyaW0yMiIsImEiOiJjang3bG9tNDEwYXRoM3BwbjJxemIxbTFjIn0.VqnnN1eF1zKssng57g6g5w', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoia2FyaW0yMiIsImEiOiJjang3bG9tNDEwYXRoM3BwbjJxemIxbTFjIn0.VqnnN1eF1zKssng57g6g5w'
}).addTo(mymap);
mymap.zoomControl.setPosition('bottomleft');
let achenSvgString = "<svg xmlns='http://www.w3.org/2000/svg' width='46' height='56'><path fill-rule='evenodd' d='M39.263 7.673c8.897 8.812 8.966 23.168.153 32.065l-.153.153L23 56 6.737 39.89C-2.16 31.079-2.23 16.723 6.584 7.826l.153-.152c9.007-8.922 23.52-8.922 32.526 0zM23 14.435c-5.211 0-9.436 4.185-9.436 9.347S17.79 33.128 23 33.128s9.436-4.184 9.436-9.346S28.21 14.435 23 14.435z'/></svg>";
let myIconUrl = encodeURI("data:image/svg+xml," + achenSvgString).replace('#', '%23');

var Icon = L.icon({
    iconUrl: myIconUrl,

});
 let marker = L.marker([0, 0], { icon: Icon }).addTo(mymap);