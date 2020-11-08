module.exports = {
  apps : [{
    name: 'webrtcsocket',
    script: 'index.js',
    watch: true,
    env: {
      PORT: 8443,
      SSL : true,
      SSLKEY : '/etc/letsencrypt/live/mydomain/privkey.pem',
      SSLCERT  : '/etc/letsencrypt/live/mydomain/fullchain.pem',
      DEBUG : false
    }
  }]
};
