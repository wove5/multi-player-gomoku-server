window.onload = function () {
  //<editor-fold desc="Changeable Configuration Block">
  const devServerHost = 'http://192.168.1.197';
  // the following lines will be replaced by docker/configurator, when it runs in a docker-container
  window.ui = SwaggerUIBundle({
    url: '/api/api-docs/swagger.json',
    // url: "https://petstore.swagger.io/v2/swagger.json",
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: 'StandaloneLayout',
    showCommonExtensions: true,
    showExtensions: true,
    validatorUrl: `http://192.168.1.197:8080/validator?url=http://192.168.1.197:8081/api/api-docs/swagger.json`,
    // validatorUrl: `${devServerHost}:8080/validator?url=${devServerHost}8081/api/api-docs/swagger.json`,
    // above does not work
    // validatorUrl: null, // do not validate specs against any validator and remove the validator badge
  });

  //</editor-fold>
};
