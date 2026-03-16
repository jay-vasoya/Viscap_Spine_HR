'use strict';

const cds  = require('@sap/cds');
const path = require('path');

// Bootstrap hook – runs before CDS serves
cds.on('bootstrap', (app) => {

  // CORS for local dev
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  // Serve UI5 Fiori App statically
  const express = require('express');
  app.use('/app/hrms/webapp', express.static(
    path.join(__dirname, 'app', 'hrms', 'webapp')
  ));

  // Redirect root -> Fiori app
  app.get('/', (req, res) => {
    res.redirect('/app/hrms/webapp/index.html');
  });
});

// Ready hook – print banner after server starts
cds.on('listening', ({ server }) => {
  const addr = server.address();
  const port = addr ? addr.port : 4004;
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║           VISCAP HRMS - CAP + SAP Fiori UI5 App              ║
╠══════════════════════════════════════════════════════════════╣
║  Fiori App  ->  http://localhost:${port}/
║  OData V4   ->  http://localhost:${port}/odata/v4/hrms/
║  Metadata   ->  http://localhost:${port}/odata/v4/hrms/$metadata
╚══════════════════════════════════════════════════════════════╝
  `);
});

// CDS v9 – export cds.server (replaces old cds.serve().in().catch())
module.exports = cds.server;