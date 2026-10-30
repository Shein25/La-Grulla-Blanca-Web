/** Structural authority only. No stocks, patients, documents, nodes or production seeds. */
const freeze = x => { if (x && typeof x === 'object') { Object.values(x).forEach(freeze); Object.freeze(x); } return x; };
const DOMAIN_AUTHORITY = freeze({
  source: { path: 'docs/integracion/astra/MATRIZ_NPC_FINAL.json',
    sha256: '1495c412a433a5b8509878381295083e50f6c1800513653255c13570f854f60b' },
  domains: {
    LOGISTICS: { actors: ['duan_shibo', 'ma_qiren', 'pei_luo', 'ma_gu', 'han_qiao'], fields: ['stock', 'reserved', 'deliveries', 'destinations'] },
    ARCHIVE: { actors: ['song_rui', 'yu_shun', 'zhao_wen'], fields: ['catalogEntries', 'documentIntegrity', 'transferRequests'] },
    MEDICAL: { actors: ['lan_meihua', 'chen_bo', 'yao_fen'], fields: ['patients', 'severity', 'treatmentStatus'] },
    FORMATIONS: { actors: ['he_zhen', 'wen_tao'], fields: ['nodes', 'integrity', 'energy', 'repairStatus'] },
  },
});
const FRONT_AUTHORITY = freeze({
  source: { path: 'docs/integracion/astra/MATRIZ_REQUISITOS_ARC1.json',
    sha256: '3a32e0e069decaad9a28f1c71cca5e16169021bb6a33d633bfd992d6a62efab6',
    requirements: ['R-M16-FRONTS', 'R-M16-END'], metadata: 'explicitResolutions:M16.resueltoPor' },
  ids: ['MEDICINA', 'RUTAS', 'FORMACIONES', 'RECURSOS', 'SAUCES', 'JARDINES'],
  states: ['PENDIENTE', 'ESTABLE', 'COSTOSO', 'DAÑADO'],
  companions: ['lin_yue', 'han_qiao', 'zhao_wen', 'mei_lian', 'guo_chen', 'luo_yan'],
});

export { DOMAIN_AUTHORITY, FRONT_AUTHORITY };
