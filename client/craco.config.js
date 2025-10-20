module.exports = function override(config) {
  // Ignore warnings from @yudiel/react-qr-scanner
  config.ignoreWarnings = [
    {
      module: /@yudiel\/react-qr-scanner/,
    },
  ];

  return config;
};
