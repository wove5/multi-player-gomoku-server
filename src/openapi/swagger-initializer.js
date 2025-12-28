window.onload = function () {
  //<editor-fold desc="Changeable Configuration Block">

  // const devServerHost = 'http://192.168.1.197:8081';
  // const devServerHost = window.location.host;
  // const devServerHostIp = devServerHost.split(':')[0];
  const devServerScheme = window.location.protocol;
  console.log(`devServerScheme = ${devServerScheme}`);
  // const apiUrl = `${devServerScheme}//${devServerHost}`;
  let devServerHostIp = '';
  // const validatorUrl = `${apiUrl
  //   .split(':')
  //   .slice(0, -1)
  //   .join(':')}:8080/validator`;

  const oapiSpecUrl = devServerHostIp
    ? `${devServerScheme}//${devServerHostIp}:8081/api/api-docs/swagger.json`
    : '/api/api-docs/swagger.json';
  console.log(`oapiSpecUrl = ${oapiSpecUrl}`);

  const validatorUrl = devServerHostIp
    ? `${devServerScheme}//${devServerHostIp}:8080/validator`
    : null;
  console.log(`validatorUrl = ${validatorUrl}`);

  // the following lines will be replaced by docker/configurator, when it runs in a docker-container
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = '/swagger-custom.css';
  document.head.appendChild(link);
  window.ui = SwaggerUIBundle({
    // url: '/api/api-docs/swagger.json',
    url: `${oapiSpecUrl}`,
    // url: 'http://localhost:8081/api/api-docs/swagger.json',
    // url: "https://petstore.swagger.io/v2/swagger.json",
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: 'StandaloneLayout',
    showCommonExtensions: true,
    showExtensions: true,
    // validatorUrl: `http://192.168.1.197:8081/validator?url=http://192.168.1.197:8081/api/api-docs/swagger.json`,
    // validatorUrl: `${devServerHost}:8080/validator?url=${devServerHost}8081/api/api-docs/swagger.json`,
    // above does not work
    // validatorUrl: 'https://validator.swagger.io/validator', // set the validator to the public Swagger validator
    // that is the default anyway
    // validatorUrl: null, // do not validate specs against any validator and remove the validator badge
    // this is the best solution for now. Can later look into hosting private self-hosted validator
    // validatorUrl:
    //   'http://197.168.1.197:8080/validator?url=http://localhost:8081/api/api-docs/swagger.json',
    // validatorUrl: 'http://192.168.1.197:8080/validator',
    // validatorUrl: 'http://localhost:8080',
    validatorUrl,
    swaggerOptions: {
      customCss:
        '.swagger-ui .responses-table td { padding: 15px 0 !important;}',
    },
  });

  //</editor-fold>
};
