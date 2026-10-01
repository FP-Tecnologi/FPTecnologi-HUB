/*
 * Directorio de agencias Shalom (departamento -> provincia -> agencias), obtenido de la consulta
 * pública de agencias de Shalom y reutilizado del proyecto MemoAI-SCROLL. Los nombres de
 * departamento/provincia siguen el ubigeo del INEI. Es una foto estática: para refrescarla hay
 * que volver a consultar a Shalom. Archivo generado; no editar a mano.
 */
export interface AgenciaShalomRaw {
  zona: string;
  direccion: string;
  telefono: string | null;
  horario: string;
  lat: number | null;
  lng: number | null;
}

export const SHALOM_AGENCIAS: Record<string, Record<string, AgenciaShalomRaw[]>> = {
 "Cajamarca": {
  "Hualgayoc": [
   {
    "zona": "BAMBAMARCA",
    "direccion": "AV. TUPAC AMARU 1105, REFERENCIA: AL COSTADO DEL PARADERO AL CUMBE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -6.677954,
    "lng": -78.525601
   }
  ],
  "Cajamarca": [
   {
    "zona": "CAJAMARCA",
    "direccion": "Av. Independencia N° 787 Barrio Santa Elena",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.1712133,
    "lng": -78.5120151
   },
   {
    "zona": "CAJAMARCA",
    "direccion": "aeropuerto MAYOR GENERAL FAP ARMANDO REVOREDO IGLESIAS",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": null,
    "lng": null
   },
   {
    "zona": "CAJAMARCA",
    "direccion": "Jr. Chanchamayo N° 1162 - Barrio San José Cajamarca,  REFERENCIA: Paralela Con Jr. Huancavelica y Jr. Sara Macdougall.",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.1497829958282,
    "lng": -78.5206235201
   },
   {
    "zona": "CAJAMARCA",
    "direccion": "JIRÓN LOS GLADIOLOS N° 336 BARRIO SAN MARTÍN, CAJAMARCA – CAJAMARCA – CAJAMARCA, REF. A LA ALTURA DE LA CDRA. 13 DE LA VÍA DE EVITAMIENTO SUR /A UNA CDRA. DE LA UNIVERSIDAD NACIONAL DE CAJAMARCA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.1699003050971,
    "lng": -78.499003664337
   },
   {
    "zona": "CAJAMARCA",
    "direccion": "JR. EMILIO BARRANTES MZ X LOTE 3 URB. HORACIO ZEVALLOS - CAJAMARCA. REFERENCIA A UNA CUADRA DE LA UNIVERSIDAD PRIVADA DEL NORTE (UPN) Y VÍA DE EVITAMIENTO NORTE CUADRA 13.",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.1494038,
    "lng": -78.5064654
   },
   {
    "zona": "CAJAMARCA",
    "direccion": "MZ. A LOTE S/N – BARRIO HUAMBOCANCHA BAJA – CAJAMARCA, REF. A UNA CDRA. DEL PARADERO DE LA P13/AL COSTADO DEL CAMPO DEPORTIVO EL PATRIARCA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -7.118417325098,
    "lng": -78.528418064811
   },
   {
    "zona": "JESUS",
    "direccion": "MZ. A LOTE S/N CP HUARACLLA - JESUS - CAJAMARCA, REF. A UNA CDRA. DE LA I.E. JOSÉ OLAYA BALANDRA.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -7.2328604675508,
    "lng": -78.410917671899
   },
   {
    "zona": "LOS BANOS DEL INCA",
    "direccion": "JR. CAHUIDE N° 242 – LOTIZ. HURTADO MILLER – BAÑOS DEL INCA – CAJAMARCA, REF. A ESPALDAS DE SENATI Y A UNA CDRA. DE LA BASE DE SERENAZGO DE BAÑOS DEL INCA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.163558261272,
    "lng": -78.468443729448
   }
  ],
  "Chota": [
   {
    "zona": "CHOTA",
    "direccion": "AV. FRAY JOSÉ ARANA N 805 - REFERENCIA : frente al terminal angel divino",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -6.562775,
    "lng": -78.653349
   }
  ],
  "Cutervo": [
   {
    "zona": "CUTERVO",
    "direccion": "av. SALOMÓN VILCHEZ murga  S/N. CDRA 9  REFERENCIA : FRENTE A LA CLÍNICA CUTERVO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.37884,
    "lng": -78.812233
   }
  ],
  "Celendín": [
   {
    "zona": "CELENDIN",
    "direccion": "JR. PEDRO ORTIZ MONTOYA 148, REFERENCIA: ESQUINA CON AV. AMAZONAS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.8714795543587,
    "lng": -78.14372690136
   }
  ],
  "San Marcos": [
   {
    "zona": "PEDRO GALVEZ",
    "direccion": "JR. ADOLFO AMORIN BUENO N° 140 SAN MARCOS – CAJAMARCA, REF. AL  FRENTE DE LA PLAZA AGROPECUARIA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.3343555505042,
    "lng": -78.174261935812
   }
  ],
  "San Miguel": [
   {
    "zona": "SAN MIGUEL",
    "direccion": "JR. BOLOGNESI N° 717 – SAN MIGUEL – CAJAMARCA - CAJAMARCA, REF. AL COSTADO DEL COLISEO Y EL PARADERO DE LLAPA Y COCHÁN.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -7.0007791311052,
    "lng": -78.849751341107
   }
  ],
  "San Pablo": [
   {
    "zona": "SAN PABLO",
    "direccion": "JR. TNT. LORENZO IGLESIA N° 910 - SAN PABLO – CAJAMARCA - CAJAMARCA, REF. A MEDIA CDRA. DEL HOSPITAL SAN PABLO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.1151079999997,
    "lng": -78.823372000001
   }
  ],
  "Cajabamba": [
   {
    "zona": "CAJABAMBA",
    "direccion": "JR. LARA N° 100 ,CAJABAMBA - CAJABAMBA - CAJAMARCA, REF. A UNA CDRA. DEL COMPLEJO DEPORTIVO “SANTA ANA”",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.6268617255628,
    "lng": -78.048167560925
   }
  ],
  "Contumazá": [
   {
    "zona": "CHILETE",
    "direccion": "JR. SANTA ROSA N° 121, CHILETE – CONTUMAZÁ – CAJAMARCA, REF. A UNA CDRA. DEL TERRAPUERTO Y A 100 MTS. DEL PUENTE DE INGRESO A CHILETE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.2225019957084,
    "lng": -78.838027799969
   },
   {
    "zona": "YONAN",
    "direccion": "JR. BOLOGNESI S/N – TEMBLADERA - YONAN - CONTUMAZÁ - CAJAMARCA, REF. AL FRENTE DEL PARQUE VÍCTOR RAÚL HAYA DE LA TORRE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -7.2525846006918,
    "lng": -79.132860979091
   }
  ],
  "Jaén": [
   {
    "zona": "JAEN",
    "direccion": "AV. PAKAMMUROS CUADRA 6 S/N - referencia: ESQUINA CON CALLE LIBERTAD N° 490",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.7098471730858,
    "lng": -78.80305781963
   }
  ],
  "San Ignacio": [
   {
    "zona": "SAN IGNACIO",
    "direccion": "PASAJE TRES N° 113 URB SANTA ROSA, CAJAMARCA - SAN IGNACIO, REF. FRENTE AL ESTADO MUNICIPAL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.1428081364603,
    "lng": -78.998320738098
   }
  ]
 },
 "Arequipa": {
  "Arequipa": [
   {
    "zona": "ALTO SELVA ALEGRE",
    "direccion": "AV. LIMA N° 406 – ALTO SELVA ALEGRE - AREQUIPA, REF. ESQUINA CON AV. OBRERA CUADRA 20",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.373025713808,
    "lng": -71.512111770517
   },
   {
    "zona": "ALTO SELVA ALEGRE",
    "direccion": "AUGUSTO SALAZAR BONDY MZ J LT 4 ALTO SELVA ALEGRE - AREQUIPA, REF.  A MEDIA CDRA. DE LA IGLESIA GUADALUPE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.380360193926,
    "lng": -71.525778403804
   },
   {
    "zona": "AREQUIPA",
    "direccion": "AV. PARRA 379 - Arequipa",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 7:00 AM A 8:00 PM",
    "lat": -16.414719927538,
    "lng": -71.547783910033
   },
   {
    "zona": "AREQUIPA",
    "direccion": "AV. LAMBRAMANI 325, AREQUIPA - AREQUIPA- AREQUIPA, REF. DENTRO DEL MALL LAMBRAMANI (SOTANO PISO -4)",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.410501929707,
    "lng": -71.519777129466
   },
   {
    "zona": "AREQUIPA",
    "direccion": "Aeropuerto Internacional Alfredo Rodríguez",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": 0,
    "lng": 0
   },
   {
    "zona": "CAYMA",
    "direccion": "AV. CHARCANI 401 ASOC. JOSE OLAYA, REF. FRENTE AL COLEGIO MENDEL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.339917952103,
    "lng": -71.540474523392
   },
   {
    "zona": "CAYMA",
    "direccion": "AV. RAMÓN CASTILLA N° 1000 - B  LA TOMIllA  CAYMA  -  REFERENCIA: EN LA MISMA PLAZA TOMIlla",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.3575544,
    "lng": -71.5437086
   },
   {
    "zona": "CERRO COLORADO",
    "direccion": "MZ. A, SUB LT. 2 A, ASENTAMIENTO POBLACIONAL ASOCIACIÓN CENTRO INDUSTRIAL LAS CANTERAS, CERRO COLORADO - AREQUIPA, REF. AL COSTADO DEL GRIFO PRIMAX",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.327887664431,
    "lng": -71.594528470558
   },
   {
    "zona": "CERRO COLORADO",
    "direccion": "URB. SAN FELIPE AV PUMACAHUA LT 14, CERRO COLORADO AREQUIPA, ref. A DOS CDRAS. ANTES DE LLEGAR AL METRO CENCOSUD / EX NOTARIA CONCHA REVILLA.",
    "telefono": "(01) 500 - 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.377530805257,
    "lng": -71.556889606852
   },
   {
    "zona": "CERRO COLORADO",
    "direccion": "CALLE YAVARÍ 507 B - ZAMACOLA - CERRO COLORADO – AREQUIPA, REF. A UNA CUADRA DE LA POSTA DE ZAMACOLA (MARCISA CAMPOS)",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.35166707504,
    "lng": -71.560805179972
   },
   {
    "zona": "CERRO COLORADO",
    "direccion": "AV. LOS INCAS N° 604 SEMIRURAL PACHACUTEC – CERRO COLORADO - AREQUIPA, REF. ESQUINA CON CALLE SAN MARTIN SEMIRURAL PACHACUTEC",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.392024899212,
    "lng": -71.570138064496
   },
   {
    "zona": "CERRO COLORADO",
    "direccion": "ASOC. URBANIZADORA PERUARBO SECTOR PERU ZONA I MZ. B4 LT. 4 - AUTOPISTA LA JOYA - AREQUIPA, REF. AUTOPISTA AREQUIPA - LA JOYA, A DOS CDRAS. DEL SAUNA CANDAMO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.346111743448,
    "lng": -71.6060278
   },
   {
    "zona": "CERRO COLORADO",
    "direccion": "NUEVO HORIZONTE MZ.H LOTE 12 - CERRO COLORADO - AREQUIPA, REF. CON AV.54 A CUATRO CDRAS. DE INKAFARMA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.327308817549,
    "lng": -71.5541667
   },
   {
    "zona": "CERRO COLORADO",
    "direccion": "asoc. las flores zn.2  mz.j  lt.8  - cerro colorado  -  referencia: AV 54 - A MEDIA CUADRA DE FERRETERÍA GINO",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.327233470874,
    "lng": -71.569310892237
   },
   {
    "zona": "JACOBO HUNTER",
    "direccion": "CALLE ARGENTINA # 405 - A, JACOBO HUNTER - AREQUIPA, REF. FRENTE AL CAJERO DE CAJA AREQUIPA Y ESQUINA CON EL BANCO CAJA AREQUIPA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.43913925543,
    "lng": -71.559500110635
   },
   {
    "zona": "LA JOYA",
    "direccion": "LATERAL 12 C LT. 32, EL CRUCE LA JOYA - AREQUIPA, REF. AL COSTADO DEL GRIFO PRIMAX DE LA JOYA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.492806242963,
    "lng": -71.847805600027
   },
   {
    "zona": "MARIANO MELGAR",
    "direccion": "CALLE ANCASH N° 202 - MARIANO MELGAR, REF. A LA ALTURA DEL COLISEO DEL NIÑO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.40347178489,
    "lng": -71.51149918751
   },
   {
    "zona": "MIRAFLORES",
    "direccion": "URB. RESIDENCIAL FELIPE SANTIAGO SALAVERRY - CALLE TENIENTE RODRÍGUEZ MZ. H LT. 11, MIRAFLORES - AREQUIPA - AREQUIPA, REF. A MEDIA CDRA. DE LA COMPAÑIA DE BOMBERO DE MIRAFLORES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.391344690541,
    "lng": -71.513189845233
   },
   {
    "zona": "PAUCARPATA",
    "direccion": "CALLE BELÉN N°100 - A URB. MANUEL PRADO - PAUCARPATA  REFERENCIA: A ESPALDAS DEL CC. MALL AVENTURA PORONGOCHE",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.4169283,
    "lng": -71.5124596
   },
   {
    "zona": "PAUCARPATA",
    "direccion": "AV. JESÚS N° 1100 PAUCARPATA – AREQUIPA, REF. CON ESQUINA ARTURO VILLEGAS N° 101.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.414803670337,
    "lng": -71.508945070551
   },
   {
    "zona": "SACHACA",
    "direccion": "VARIANTE DE UCHUMAYO KM 4.5 VALLE CHILI SECTOR ALTO CURAL, PARCELA 662, SACHACA - AREQUIPA - AREQUIPA, REF. A 50 MTS. DEL ÓVALO VOLVO VARIANTE UCHUMAYO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.406333467232,
    "lng": -71.592028734791
   },
   {
    "zona": "SOCABAYA",
    "direccion": "AV. SOCABAYA 301 - URB. SAN MARTÍN DE SOCABAYA, REF. AL FRENTE DEL PARQUE VICTOR BARRIGA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.43784754394,
    "lng": -71.529989703615
   },
   {
    "zona": "SOCABAYA",
    "direccion": "ASENTAMIENTO URBANO MUNICIPAL HORACIO ZEBALLOS GAMEZ SECTOR E MZ. 1 LT. 18 SOCABAYA - AREQUIPA, REF. AL COSTADO DEL COLEGIO JOULE Y/O 2 CDRAS. DEL PENAL DE SOCABAYA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.4853889,
    "lng": -71.501417370552
   },
   {
    "zona": "UCHUMAYO",
    "direccion": "URB. EL CARMEN M. E. LT. 1 CONGATA DEL DISTRITO UCHUMAYO  - AREQUIPA, REF. A DOS CDRAS. DE LA COMISARIA CONGATA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -16.445521,
    "lng": -71.61994
   },
   {
    "zona": "YURA",
    "direccion": "MZ. O LT. 4 ZNA 2 CIUDAD DE DIOS - YURA - AREQUIPA, REF. CARRETERA YURA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.306749604497,
    "lng": -71.615276458895
   }
  ],
  "Islay": [
   {
    "zona": "COCACHACRA",
    "direccion": "CENTRO POBLADO COCACHACRA MZ. N5 SUB-LOTE 5B CALLE DEAN VALDIVIA, COCACHACRA - ISLAY - AREQUIPA, REF. DEL PARQUE SAN FRANCISCO UNA CDRA. HACIA ABAJO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -17.096111691038,
    "lng": -71.773000126693
   },
   {
    "zona": "ISLAY",
    "direccion": "ASENTAMIENTO HUMANO. PUERTO NUEVO MZ. I LT. 18 AV. BELLO HORIZONTE, ISLAY - ISLAY - AREQUIPA, REF. FRENTE AL PARQUE ECOLÓGICO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.99849950877,
    "lng": -72.096777058153
   },
   {
    "zona": "MOLLENDO",
    "direccion": "MARISCAL CASTILLA 472 –A, AREQUIPA - ISLAY - MOLLENDO, REF. AL COSTADO DE CEI “MI CARRUSEL”",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -17.021804037741,
    "lng": -72.013916892237
   },
   {
    "zona": "MOLLENDO",
    "direccion": "CALLE DEAN VALDIVIA 388 CERCADO, REFERENCIA: ESQUINA CON BLONDEL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -17.0279153,
    "lng": -72.014653
   }
  ],
  "Camaná": [
   {
    "zona": "CAMANA",
    "direccion": "CALLE AGUSTÍN GAMARRA N° 451, CERCADO CAMANÁ, REFERENCIA: AL FRENTE DEL DELIVEY CASERITOS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.618666,
    "lng": -72.710622
   }
  ],
  "Caylloma": [
   {
    "zona": "MAJES",
    "direccion": "CALLE YARABAMBA, MZ. Y LT 7. VILLA EL PEDREGAL, MAJES - CAYLLOMA - AREQUIPA, REF. A MEDIA CDRA. DE LA NOTARIA TERÁN BEJAR",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.358222616241,
    "lng": -72.190472238385
   },
   {
    "zona": "MAJES",
    "direccion": "AV. LOTE COLONIZADORES. 4 PARCELA 180, MAJES - CAYLLOMA - AREQUIPA, REF. A MEDIA CDRA. DEL GRIFO EL EJE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.352289700015334,
    "lng": -72.18092614106098
   }
  ],
  "Caravelí": [
   {
    "zona": "CHALA",
    "direccion": "AV. EMANCIPACION NRO. S/N MZ. 78 LT. 10. REF. A MEDIA CDRA. DEL PARQUE DEL NIÑO CHALINO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -15.849445506231,
    "lng": -74.25530717556
   }
  ],
  "Castilla": [
   {
    "zona": "APLAO",
    "direccion": "UBICA EN LA MANZANA X1, LOTE 07, DE LA CALLE 8 DE SETIEMBRE, APLAO - CASTILLA - AREQUIPA, REF. A UNA CDRA. DE MINISTERIAL PÚBLICO FISCALÍA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -16.078428090429,
    "lng": -72.491853483296
   }
  ]
 },
 "Pasco": {
  "Pasco": [
   {
    "zona": "CHAUPIMARCA",
    "direccion": "JR. HUARICAPCHA S/N A.H. TUPAC AMARU CHAUPIMARCA, REFERENCIA: FRENTE AL NUEVO TERMINAL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -10.686749,
    "lng": -76.246862
   },
   {
    "zona": "HUAYLLAY",
    "direccion": "calle Lima S/N Barrio Arenales  Huayllay  Pasco   - REFERENCIA: AL COSTADO DEL COLEGIO CESAR VALLEJO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.0007095,
    "lng": -76.3672417
   }
  ],
  "Oxapampa": [
   {
    "zona": "OXAPAMPA",
    "direccion": "MZ. 239 SUB LOTE H – 1 OXAPAMPA - OXAPAMPA - PASCO, REF. ENTRE AV. ANGÉLICA FREY Y JR. LIMA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -10.582583283003,
    "lng": -75.398971637447
   },
   {
    "zona": "VILLA RICA",
    "direccion": "AV. LEOPOLDO KRAUSSE N° 442 VILLA RICA - OXAPAMPA - PASCO, REF. ENTRE EL JR. POZUZO Y JR. COOPERATIVA, AL COSTADO DE LA NOTARÍA GUERRA Y A 20 METROS DE LA PLAZA PRINCIPAL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -10.735805270593,
    "lng": -75.268361100077
   }
  ]
 },
 "San Martín": {
  "Moyobamba": [
   {
    "zona": "MOYOBAMBA",
    "direccion": "JR. 20 de abril  2138 -  REFERENCIA : Altura de la  pampa del  hambre",
    "telefono": "01 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.0465912,
    "lng": -76.9725996
   },
   {
    "zona": "MOYOBAMBA",
    "direccion": "JR. SERAFÍN FILOMENO N°279, MOYOBAMBA - MOYOBAMBA - SAN MARTÍN, REF. A UNA CUADRA IMEDIA DEL CUMO (CENTRO CULTURAL DE MOYOBAMBA)",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.0335151300825,
    "lng": -76.971054929448
   },
   {
    "zona": "SORITOR",
    "direccion": "JR. MIGUEL GRAU CDRA 7 N°741 MZ.05 LTE.16B, SORITOR - MOYOBAMBA - SAN MARTÍN, REF. A MEDIA CDRA. DE LA IGLESIA ASAMBLEAS DE DIOS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -6.1398617667064,
    "lng": -77.1038333
   }
  ],
  "Mariscal Cáceres": [
   {
    "zona": "JUANJUI",
    "direccion": "CARRETERA FERNANDO TERRY KM. 1 S/N REFERENCIA: AL COSTADO DE PARADERO DE AUTOS HUALLAGA EXPRESS",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.1779108,
    "lng": -76.737078
   },
   {
    "zona": "JUANJUI",
    "direccion": "JR. SARGENTO LOREZ N° 568, JUANJUI - MARISCAL CÁCERES - SAN MARTIN, REF. A UNA CDRA. DE DEL JR. HUALLAGA CDRA. 11 Y A UNA CDRA. DE IMPORTACIONES PATRICIA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.1799173139874,
    "lng": -76.731222452114
   }
  ],
  "San Martín": [
   {
    "zona": "LA BANDA DE SHILCAYO",
    "direccion": "JR. PERÚ N°186, REFERENCIA: A 2 CDRS. DE LA PLAZA DE LA BANDA DE SHILCAYO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.4914695349871,
    "lng": -76.35514024111
   },
   {
    "zona": "MORALES",
    "direccion": "JR. SARGENTO LOREZ N° 264, MORALES - SAN MARTIN, REF. A UNA CDRA. Y MEDIA DE LA PLAZA DE MORALES, FRENTE A VULCANO GAS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.4774160027321,
    "lng": -76.385222238053
   },
   {
    "zona": "TARAPOTO",
    "direccion": "JR. LEONCIO PRADO N° 1175, REFERENCIA: A UNA CUADRA DEL INSTITUTO MARÍA PARADO DE BELLIDO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.4786878039267,
    "lng": -76.365822199258
   },
   {
    "zona": "TARAPOTO",
    "direccion": "JR. TAHUANTINSUYO N° 158 - TARAPOTO - SAN MARTÍN, REF. AL COSTADO DEL GRIFO SAN MARTÍN",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.489609616265,
    "lng": -76.363556270566
   },
   {
    "zona": "TARAPOTO",
    "direccion": "JR. RAMON CASTILLA N°1362 TARAPOTO - SAN MARTIN, REF. A MEDIA CDRA. DE MANNUCCI MOTOR S.A.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.4959447897907,
    "lng": -76.372085319981
   },
   {
    "zona": "TARAPOTO",
    "direccion": "Aeropuerto Guillermo del Castillo Paredes",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": null,
    "lng": null
   },
   {
    "zona": "TARAPOTO",
    "direccion": "JR. ALFONSO UGARTE N°2283 - TARAPOTO - SAN MARTIN - SAN MARTIN, REF. FRENTE A LA CANCHA SINTÉTICO EL GOLAZO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.4952242568055,
    "lng": -76.383499958709
   }
  ],
  "Picota": [
   {
    "zona": "PICOTA",
    "direccion": "AV. FERNANDO BELAUNDE TERRY LOTE 2B PICOTA - PICOTA - SAN MARTIN. REF, A UNA CDRA. DE LA COMISARIA DE PICOTA SALIDA A BELLAVISTA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -6.9200547910068,
    "lng": -76.33327738221
   }
  ],
  "Tocache": [
   {
    "zona": "TOCACHE",
    "direccion": "AV. FERNANDO BELAUNDE C-09 MZ H6 (21), LT. 04, CERCADO DE TOCACHE, REF. FRENTE AL MERCADILLO DE TOCACHE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.186307,
    "lng": -76.517989
   },
   {
    "zona": "TOCACHE",
    "direccion": "JR. FREDY ALIAGA N°3046 -TOCACHE - TOCACHE - SAN MARTIN, REF. AL COSTADO DEL RECREO CAMPESTRE ESTRAGOS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.1900825478844,
    "lng": -76.535472388443
   },
   {
    "zona": "UCHIZA",
    "direccion": "AV. LEONCIO PRADO N°524 - UCHIZA - TOCACHE - SAN MARTIN, REF. A MEDIA CDRA. DE LA PLAZA CENTRAL / FRENTE A COOPACT",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.4599452725746,
    "lng": -76.462081959446
   }
  ],
  "Rioja": [
   {
    "zona": "ELIAS SOPLIN VARGAS",
    "direccion": "JR. LIMA MZ. 43 LT. 08 , ELIAS SOPLIN VARGAS - RIOJA - SAN MARTIN, REF. AL COSTADO DE TIENDA CHINGAY",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 12:00 PM",
    "lat": -5.9887225879191,
    "lng": -77.279860552607
   },
   {
    "zona": "NUEVA CAJAMARCA",
    "direccion": "AV. CAJAMARCA NORTE MZ. 51 LT. 15, REFERENCIA: AL COSTADO DE ESSALUD",
    "telefono": "015007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.92927759481,
    "lng": -77.3132981226
   },
   {
    "zona": "PARDO MIGUEL",
    "direccion": "JR. MIGUEL GRAU 101 MZ. 34 LT. 6, PARDO MIGUEL - RIOJA - SAN MARTIN, REF. AV. MARGINAL CDRA 5",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -5.739746366208,
    "lng": -77.501779316434
   },
   {
    "zona": "RIOJA",
    "direccion": "CTRA. FERNANDO BELAÚNDE TERRY N° 415, REFERENCIA: AL COSTADO DE LA CLÍNICA CHILCON HOPE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -6.053861100001365,
    "lng": -77.16166602945009
   }
  ],
  "Lamas": [
   {
    "zona": "LAMAS",
    "direccion": "JR. 16 DE OCTUBRE N°1137, REFERENCIA: A LA ESPALDA DEL GRIFO VARGAS TELLO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -6.4187426338969,
    "lng": -76.517489745486
   }
  ],
  "El Dorado": [
   {
    "zona": "SAN JOSE DE SISA",
    "direccion": "JR. BOLOGNESI CDRA 6, SAN JOSE DE SISA - EL DORADO - SAN MARTIN, REF. ALTURA DE JR LAMAS Y JR ELADIO TAPULLIMA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -6.6129721999995,
    "lng": -76.691166029444
   }
  ],
  "Bellavista": [
   {
    "zona": "BELLAVISTA",
    "direccion": "AV. LIMA S/N C-4 MZ 71 – LOTE A – TERCER PISO, BELLAVISTA- BELLAVISTA- SAN MARTIN, REF. ESPALDAS DE FERRETERÍA EL IMAN",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.0574980035849,
    "lng": -76.590528470552
   }
  ],
  "Huallaga": [
   {
    "zona": "SAPOSOA",
    "direccion": "AV. LORETO S/N - SAPOSOA - EL HUALLAGA - SAN MARTIN, REF. EN EL HOSTAL EL GATO, A UNA CDRA. Y MEDIA DE LA PLAZA DE ARMAS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -6.9342505921754,
    "lng": -76.772416367679
   }
  ]
 },
 "Apurímac": {
  "Abancay": [
   {
    "zona": "ABANCAY",
    "direccion": "AV. PANAMERICANA S/N - ABANCAY - APURÍMAC, REF. A 100 METROS DE LA COMISARÍA DE BELLAVISTA, AL COSTADO DE MADERERA VEGA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.638156277625,
    "lng": -72.898993460113
   }
  ],
  "Andahuaylas": [
   {
    "zona": "ANDAHUAYLAS",
    "direccion": "AV. MALINAS 1355 POCHCCOTA, ANDAHUAYLAS - ANDAHUAYLAS -  APURÍMAC, REF. AL COSTADO DE LA EX CANCHA EL CENTENARIO O ALTURA DE LA UNIVERSIDAD UNSAAC",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.660854303166,
    "lng": -73.375429023314
   }
  ],
  "Cotabambas": [
   {
    "zona": "CHALLHUAHUACHO",
    "direccion": "BARRIO WICHAYPAMPA LT. 13 - 15 - 16, CHALLHUAHUACHO - COTABAMBAS - APURÍMAC, REF. A DOS CDRAS DEL TERMINAL TERRESTRE DE CHALLHUAHUACHO / A ESPALDAS DEL TALLER E&L",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -14.123588600655,
    "lng": -72.25614026073
   }
  ]
 },
 "Áncash": {
  "Santa": [
   {
    "zona": "CHIMBOTE",
    "direccion": "Av. Enrique Meiggs N° 2457.",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.0939502716064,
    "lng": -78.568466186523
   },
   {
    "zona": "CHIMBOTE",
    "direccion": "PAR. PARCELA N° 16757 - E SECTOR LA PERLA TRES CABEZAS - ANCASH, REF. FRENTE AL ESTADIO CENTENARIO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.0982171678222,
    "lng": -78.558546562114
   },
   {
    "zona": "CHIMBOTE",
    "direccion": "AV. JOSÉ GÁLVEZ 791, CHIMBOTE - SANTA - ANCASH, REF. A 1 CDRA. ANTES DE LLEGAR AL PUENTE GÁLVEZ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.0711845135623,
    "lng": -78.58882269437
   },
   {
    "zona": "NUEVO CHIMBOTE",
    "direccion": "Urbanización José Carlos Mariategui (ex UNICRETO) mz R 3 lt 3 Ref. A una cuadra del óvalo la familia",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.127764,
    "lng": -78.517709
   },
   {
    "zona": "NUEVO CHIMBOTE",
    "direccion": "AA.HH. BELEN MZ O LT 28 - NUEVO CHIMBOTE - SANTA - ANCASH, REF. FRENTE AL GRIFO DOXA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.1329718245368,
    "lng": -78.509082613845
   },
   {
    "zona": "NUEVO CHIMBOTE",
    "direccion": "URB. NICOLAS GARATEA MZ. 100 LT. 24 - NUEVO CHIMBOTE - SANTA - ANCASH, REF. FRENTE AL PARADERO AUTOS N.- GARATEA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.1184982806451,
    "lng": -78.506110723207
   },
   {
    "zona": "NUEVO CHIMBOTE",
    "direccion": "AV. JOSÉ PARDO MZ. K, LT. 17 - TRES DE OCTUBRE, REFERENCIA: FRENTE AL ÓVALO LAS AMÉRICAS",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.1178189102457,
    "lng": -78.537899051291
   },
   {
    "zona": "SANTA",
    "direccion": "PANAMERICANA NORTE KM 442 - B, SANTA, REF. AL LADO DE LA FERRETERIA LA LLAVE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.9894225762046,
    "lng": -78.617430260416
   }
  ],
  "Huaraz": [
   {
    "zona": "HUARAZ",
    "direccion": "AV. 27 DE NOVIEMBRE CDRA. 20 S/N - VILLON BAJO, REFERENCIA: AL COSTADO DEL GRIFO PRIMAX",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.541547,
    "lng": -77.531075
   }
  ],
  "Casma": [
   {
    "zona": "CASMA",
    "direccion": "AV. MIGUEL GRAU MZ. D 4 LT. 1 CASMA - ANCASH, REF. FRENTE AL JARDÍN DE INFANCIA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.4718613228196,
    "lng": -78.303136341104
   }
  ],
  "Carhuaz": [
   {
    "zona": "CARHUAZ",
    "direccion": "CARRETERA CENTRAL 00S/N CENT CARHUAZ - CARHUAZ - ÁNCASH, ref. MEDIA CUADRA ANTES DE LLEGAR AL ESTADIO MUNICIPAL CAPITAN CARLOS MEJIA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.2841105,
    "lng": -77.6468648
   }
  ],
  "Yungay": [
   {
    "zona": "YUNGAY",
    "direccion": "JR. INDUSTRIAL, LTE. 14 - YUNGAY, REF. AL COSTADO DEL TERMINAL TERRESTRE Y LA TAPICERIA FREDY",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.1397382909279,
    "lng": -77.747211445572
   }
  ],
  "Huaylas": [
   {
    "zona": "CARAZ",
    "direccion": "AV. 9 DE OCTUBRE N° 259 - HUAYLAS, REFERENCIA: AL COSTADO DE LA EMPRESA MÓVIL TOURS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.0478790288089,
    "lng": -77.803470533954
   }
  ],
  "Huarmey": [
   {
    "zona": "HUARMEY",
    "direccion": "CARR. PANAMERICANA NORTE N° KM 293 SECT. PANAMERICANA HUARMEY – ANCASH, REF. A 4 CDRAS. DEL TERMINAL TERRESTRE DE SUR A NORTE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -10.064877234999,
    "lng": -78.156818888783
   }
  ]
 },
 "Cusco": {
  "Cusco": [
   {
    "zona": "CUSCO",
    "direccion": "ARCO TICATICA PUSTIPATA, LT. N° A - 11 - 2, CUSCO, REF. EN LA AV. PRINCIPAL A 3 CDRAS. DEL MERCADO TICA TICA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.507250998862,
    "lng": -71.998752093836
   },
   {
    "zona": "CUSCO",
    "direccion": "AEROPUERTO INTERNACIONAL ALEJANDRO VELASCO ASTETE",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": null,
    "lng": null
   },
   {
    "zona": "SAN JERONIMO",
    "direccion": "CALLE CIRO ALEGRÍA 226 - 224, REF. UNA CUADRA ANTES DEL PARADERO PENAL EN EL CARRIL DE BAJADA",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.545038230775,
    "lng": -71.895806395877
   },
   {
    "zona": "SAN SEBASTIAN",
    "direccion": "URB. TUPAC AMARU B-1-2 SAN SEBASTIAN – CUSCO, REF. TERMINANDO LA VIA EXPRESA ZONA SUR",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.539137908489,
    "lng": -71.906443678608
   },
   {
    "zona": "SAN SEBASTIAN",
    "direccion": "URB. CACHIMAYO A-37 AV. LA CULTURA – SAN SEBASTIAN – CUSCO, REF. ENTRE PARADERO ENACO Y PARQUE CACHIMAYO, A 2 CUADRA DE LA UNIVERSIDAD ANDINA.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.534609281872,
    "lng": -71.910668384545
   },
   {
    "zona": "SAN SEBASTIAN",
    "direccion": "AV. EVITAMIENTO S/N UPS CHACAHUAYCO, SAN SEBASTIAN - CUSCO - CUSCO, REF. VÍA EVITAMIENTO EN EL PARADERO HORACIO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.542279103821,
    "lng": -71.918194399996
   },
   {
    "zona": "SANTIAGO",
    "direccion": "Prolongación Av. Antonio Lorena # 140 - Santiago, Cusco, Referencia: al frente del cementerio Almudena",
    "telefono": "015007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.5257396,
    "lng": -71.9879012
   },
   {
    "zona": "SANTIAGO",
    "direccion": "URB. VILLA UNION F-1-B HUANCARO, SANTIAGO - CUSCO - CUSCO, REF. FRENTE A LA IGLESIA DE LOS MORMONES/ A UNA CDRA. DEL MERCADO HUANCARO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.538445249518222,
    "lng": -71.981750657335
   },
   {
    "zona": "SANTIAGO",
    "direccion": "AV. INDUSTRIAL URB. BANCOPATA J-20, SANTIAGO - CUSCO, REF. A 2 CDRAS. DEL OVALO PACHACUTEC, FRENTE A LA EMPRESA COCA COLA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.53302993621,
    "lng": -71.970140480922
   },
   {
    "zona": "WANCHAQ",
    "direccion": "AV. LAS AMERICAS MZ. E LT. 20, 2DA ETAPA, URB. PARQUE INDUSTRIAL, WANCHAQ - CUSCO, REF. AL FRENTE DE TALLERES PFURO, AL FRENTE DE MEDERERA URPI, PARALELA A LA AV VIA EXPRESA.",
    "telefono": "015007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.532971798458,
    "lng": -71.944027560633
   },
   {
    "zona": "WANCHAQ",
    "direccion": "AV. PACHACUTEC 429 - WANCHAQ, REF. A 100 MTRS. DE LA PISCINA WANCHAQ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.524395751135,
    "lng": -71.970136579029
   },
   {
    "zona": "WANCHAQ",
    "direccion": "VELASCO ASTETE D3 - WANCHAQ, REFERENCIA: A 2 CDRAS. DEL AEREOPUERTO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -13.53848438482397,
    "lng": -71.94663732182276
   }
  ],
  "Canchis": [
   {
    "zona": "COMBAPATA",
    "direccion": "AV. SEÑOR DE HUANCA S/N - COMBAPATA - CANCHIS - CUSCO, REF. AL COSTADO DEL GRIFO SEÑOR DE QOYLLURITI - A ORILLAS DE LA MISMA CARRETERA A SICUANI",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -14.102278291534,
    "lng": -71.427169751185
   },
   {
    "zona": "SICUANI",
    "direccion": "PROLONG. AV. AREQUIPA 1010  S/N, REF: AL COSTADO DEL GRIFO GUADALUPE EN EL ÓVALO SAN ANDRÉS",
    "telefono": "015007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -14.285420707913,
    "lng": -71.225136970083
   },
   {
    "zona": "SICUANI",
    "direccion": "JR. INAMBARI NRO. 208, SICUANI - CANCHIS - CUSCO, REF. AL FRENTE DEL BCP Y DE CAJA PIURA",
    "telefono": "015007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -14.268306864713,
    "lng": -71.227834102622
   }
  ],
  "Anta": [
   {
    "zona": "ANTA",
    "direccion": "PARQUE DEL CARMEN LT. 1 MZ. B 2, ANTA - ANTA - CUSCO, REF. PARADERO CARMEN, PISTA PRINCIPAL IZCUCHACA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -13.469611752105,
    "lng": -72.135833970585
   }
  ],
  "Urubamba": [
   {
    "zona": "CHINCHERO",
    "direccion": "AV. MATEO PUMACAHUA S/N, CHINCHERO - URUBAMBA - CUSCO, ref AL COSTADO DE LA CAJA CUSCO / EN LA MISMA CARRETERA A URUBAMBA",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -13.3916558,
    "lng": -72.050836126361
   },
   {
    "zona": "URUBAMBA",
    "direccion": "LT. E-3 FRACCIÓN -1, SECTOR PATAHUASI, URUBAMBA – URUBAMBA - CUSCO, REF. A UNA CDRA. DE LA CARRETERA A OLLANTAYTAMBO / A MEDIA CDRA. DEL PARQUE TERESITA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.300611752565,
    "lng": -72.125221529448
   }
  ],
  "La Convención": [
   {
    "zona": "PICHARI",
    "direccion": "ASOC. GRAL. JUAN VELASCO A. MZ. B LT. 2 , PICHARI - LA CONVENCION – CUSCO, REF. AL COSTADO DE TECHO PROPIO",
    "telefono": "01 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.522202082844,
    "lng": -73.823762832914
   },
   {
    "zona": "SANTA ANA",
    "direccion": "JR. PUNO LT. 10 Y 11 MZ. G URB. SANTA ANA, CUSCO - LA CONVENCION - SANTA ANA, REF. A MEDIA CDRA.l DEL ESTADIO MUNICIPAL DE QUILLABAMBA / CRUCE CON PROLONGACION Jr. MARTIN PIO CONCHA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.867000552803,
    "lng": -72.691361212547
   }
  ],
  "Calca": [
   {
    "zona": "CALCA",
    "direccion": "AV. VILCANOTA MZ. A LT 4 CALCA - CUSCO, REF. FRENTE AL GRIFO PETRO PERÚ O EL ÓVALO PUMA - ENTRADA DE CALCA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.32544905492,
    "lng": -71.953392422748
   },
   {
    "zona": "PISAC",
    "direccion": "AV VILCANOTA S/N, PISAC - CALCA - CUSCO, REF. A MEDIA CDRA. DEL PUENTE DE PISAC / CARRETERA A TARAY",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.423507817134,
    "lng": -71.85281378755
   }
  ],
  "Quispicanchi": [
   {
    "zona": "OCONGATE",
    "direccion": "SECT. MAYO UCJO S/N, OCONGATE - QUISPICANCHI - CUSCO, REF. A LA ESPALDA DEL TERMINAL DE BUSES DE OCONGATE / A ORILLAS DE LA CARRETA A MAZUKO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -13.627390139692,
    "lng": -71.388750657298
   },
   {
    "zona": "OROPESA",
    "direccion": "SEC. CHIMPAPAMPA APV. JOSE CCARLOS MAREATEGUI S/N, OROPESA - QUISPICANCHI - CUSCO, REF. A UNA CDRA. DE LA CARRETA A URCOS / A UNA CDRA. DE LA PANIFICADORA CACHITO AMARILLO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -13.600056251744,
    "lng": -71.76866737056
   },
   {
    "zona": "URCOS",
    "direccion": "MAYUPATA S/N PAUCARBAMBA, URCOS - QUISPICANCHI - CUSCO REFERENCIA: AL FRENDE DEL ESTADIO MUNICIPAL DE URCOS / AL FRENTE DEL TERMINAL TERRESTRE DE URCOS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.683279585148,
    "lng": -71.623473408855
   }
  ],
  "Espinar": [
   {
    "zona": "YAURI ( ESPINAR )",
    "direccion": "CALLE SAN JOSE N° 703 BARRIO PROGRESO, YAURI (ESPINAR) - ESPINAR - CUSCO, REF.  A MEDIA CDRA. DEL GRIFO SAN JOSE / A MEDIA CDRA. DE LA AV. TINTAYA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -14.794805680154,
    "lng": -71.40547176079
   }
  ],
  "Chumbivilcas": [
   {
    "zona": "SANTO TOMAS",
    "direccion": "CALLE BOLOGNESI MZ. 02 LT. 25, SANTO TOMAS - CHUMBIVILCAS - CUSCO, REF. A ESPALDAS DE LA POLLERIA PICO DORADO Y A MEDIA CDRA. DE LA AV SANTA BARBARA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -14.450639460425,
    "lng": -72.084860024965
   }
  ]
 },
 "Lima": {
  "Huaura": [
   {
    "zona": "HUACHO",
    "direccion": "PROLONGACIÓN salaverry  n° 764  huacho -  referencia : cruce con la av la paz",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.1094203,
    "lng": -77.5991073
   },
   {
    "zona": "HUACHO",
    "direccion": "AV. MERCEDES INDACOCHEA 1276 HUACHO - HUAURA - LIMA, REF. INTERSECCIÓN CON PEDRO RUIZ GALLO, A 2 CDRAS. DE LA UNIVERSIDAD NACIONAL JOSÉ FAUSTINO SÁNCHEZ CARRIÓN",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.1185268130511,
    "lng": -77.6103892352451
   },
   {
    "zona": "HUAURA",
    "direccion": "AV. LAS MALVINAS MZ. C LOTE 16 URB. EL ROSARIO SUR HUAURA, REF. A ESPALDAS DE LA PLAZA DE ARMAS, A 1 CDRA. DE LA CALLE LOS ALAMOS",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.0713592723957,
    "lng": -77.5999746859657
   },
   {
    "zona": "SAYAN",
    "direccion": "CALLE NARANJO N° 211.SAYAN - HUAURA - LIMA, REF. A MEDIA CDRA. DE LA PLAZA DE ARMAS Y DE LA MUNICIPALIDAD",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.135195879940518,
    "lng": -77.19272381237359
   }
  ],
  "Cañete": [
   {
    "zona": "CHILCA",
    "direccion": "ANTIGUA PANAMERICANA SUR CDRA. 11 MZ. 46, LT. 08. CHILCA - CAÑETE - LIMA, REF. A MEDIA CDRA. DEL HOTEL EL PACÍFICO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.519499635745452,
    "lng": -76.73222309911321
   },
   {
    "zona": "IMPERIAL",
    "direccion": "JR. AUGUSTO B. LEGUÍA N.º 457, MZ E, CENTRO POBLADO IMPERIAL, IMPERIAL - CAÑETE - lima, ref. CEVICHERÍA BRISAS DEL MAR",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.059358624396962,
    "lng": -76.35372113923681
   },
   {
    "zona": "MALA",
    "direccion": "Av. Marchand # 250, distrito de Mala .    referencia:  a unas casas frente a la distribuidora primax gas",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.6571028,
    "lng": -76.6366831
   },
   {
    "zona": "NUEVO IMPERIAL",
    "direccion": "FUNDO SANTA ADELA, MZ. A, LOTES 8 Y 9 – CARRETERA CAÑETE A YAUYOS NUEVO IMPERIAL - CAÑETE - LIMA, REF. AL COSTADO DEL RESTAURANT LA RUTA BRAVA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.071831653175837,
    "lng": -76.33534999999453
   },
   {
    "zona": "SAN VICENTE DE CANET",
    "direccion": "AA.HH. VÍCTOR ANDRÉS BELAUNDE MZ. B LT. 12, SAN VICENTE DE CAÑETE - CAÑETE - LIMA",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -13.076518251018443,
    "lng": -76.39128869885437
   },
   {
    "zona": "SAN VICENTE DE CANET",
    "direccion": "JR. SANTA RITA 399, REF. CRUCE CON AV. LIBERTADORES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -13.076170653164965,
    "lng": -76.39023934110445
   }
  ],
  "Lima": [
   {
    "zona": "ANCON",
    "direccion": "CARRETERA SERPENTÍN DE PASAMAYO MZ. G LT. 3 SUBLT. B - ASOC. DE PROP. CASA HUERTA IND. PECUARIAS SAN PEDRO ZONA 4, ANCÓN - LIMA-LIMA, REF. A 1 CDRA. DEL OVALO DE ANCÓN",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.774039837812818,
    "lng": -77.16181025497632
   },
   {
    "zona": "ATE-VITARTE",
    "direccion": "AV. ANDRÉS AVELINO CÁCERES MZ G LT. 14, 1ER PISO PROG DE VIV. PHILADELFIA DE ATE IV ETAPA, ATE VITARTE - LIMA - LIMA, REF. A UNA CDRA. DE LA CTRA. CENTRAL, PARADERO EL LAVADERO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.998277984658,
    "lng": -76.834139993339
   },
   {
    "zona": "ATE-VITARTE",
    "direccion": "Av. Nicolás Ayllón N° 3080  - Ate vitarte",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.057126998901367,
    "lng": -76.96934509277344
   },
   {
    "zona": "ATE-VITARTE",
    "direccion": "AV. SANTA ROSA N°773 MANZANA “A” LOTE 6 URB LOS SAUCES - ATE - REFERENCIA: CRUCE CON LA AV SEPARADORA INDUSTRIAL",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.0709298,
    "lng": -76.9809503
   },
   {
    "zona": "ATE-VITARTE",
    "direccion": "Av. Pedro Ruíz Gallo Mz. H Lt. 3. Asoc. Viv. Villa San Luis, Santa Clara - Ate Vitarte - LimaRef: Entre el Real Plaza y la UTP Santa Clara",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.013911972067262,
    "lng": -76.88419892952268
   },
   {
    "zona": "ATE-VITARTE",
    "direccion": "AV. EL SOL MZ. S LT. 2 ZONA 03 - ASOC. PARQUE INDUSTRIAL EL ASESOR, SECTOR 010 ZONA 03 - ATE, REF. A UNA CUADRA Y MEDIA DE LA CARRETERA CENTRAL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.038365169091593,
    "lng": -76.93396781379997
   },
   {
    "zona": "ATE-VITARTE",
    "direccion": "AV. ESPERANZA MZ. K LT. 06 LAS AMERICAS - ATE VITARTE - LIMA, REF. PASANDO MERCADO RAUCANA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.03197489814294,
    "lng": -76.90489476767831
   },
   {
    "zona": "ATE-VITARTE",
    "direccion": "AV. HORACIO ZEBALLOS MZ. V LT. 12 PROG. VIV. RESIDENCIAL PARIACHI (SEC. 031) ZONA 5, ATE - LIMA - LIMA, REF. FRENTE AL CIRCUITO DE MANEJO GARCILASO DE LA VEGA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.007693484031522,
    "lng": -76.8424867018833
   },
   {
    "zona": "ATE-VITARTE",
    "direccion": "AV. MARCO PUENTE LLANOS 309, MZ. A, LT. 03",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.032176320939,
    "lng": -76.921789902195
   },
   {
    "zona": "ATE-VITARTE",
    "direccion": "AV. JOSE CARLOS MARIATEGUI MZA. B LTE 06, RESIDENCIAL PARIACHI SEC. 031 ZON. 05, ATE - LIMA - LIMA, REF. CRUCE CON LA AV. LOS INCAS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.004388120507466,
    "lng": -76.83611140249312
   },
   {
    "zona": "ATE-VITARTE",
    "direccion": "AV. JOSÉ CARLOS MARIÁTEGUI Z. E LT. 23 UCV 5 (ZONA COMERCIO) - PUEBLO JOVEN \"PROYECTO ESPECIAL HUAYCÁN\" ATE VITARTE - LIMA, REF. A DOS CDRAS. DEL CRUCE CON AV. 15 DE JULIO",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.014821320970137,
    "lng": -76.82313108705995
   },
   {
    "zona": "ATE-VITARTE",
    "direccion": "AV. FERROCARRIL MZ. C LT. 19 PARCELA 3, URB. SANTA ELVIRA SEC. 018 ZONA 3, REF. A MEDIA CDRA. DEL CRUCE CON AV. DE LA CULTURA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.028531299993436,
    "lng": -76.950749770605
   },
   {
    "zona": "BRENA",
    "direccion": "AV. VENEZUELA 1670 - BREÑA, REFERENCIA: AL COSTADO DEL POLICLÍNICO DE BREÑA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.055384807466,
    "lng": -77.055713323752
   },
   {
    "zona": "BRENA",
    "direccion": "JR. HUARAZ 1633, BREÑA -LIMA, REF. EN MEDIO DEL CRUCE DE JR. GRAL ORBEGOSO Y JR. CENTENARIO CON JR. HUARAZ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.065815746489534,
    "lng": -77.04986305455087
   },
   {
    "zona": "CARABAYLLO",
    "direccion": "MZ. 1A - LT. 8 AV. TUPAC AMARU N° 10472, CARABAYLLO - LIMA, REF. AL COSTADO DEL COLEGIO CIRO ALEGRÍA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.881139994572488,
    "lng": -77.02180581911568
   },
   {
    "zona": "CARABAYLLO",
    "direccion": "AV. TÚPAC AMARU KM. 23.5 - CARABAYLLO, REF. FRENTE A LA IGLESIA DE MORMONES - A UNA CDRA. DEL ÚLTIMO PARADERO DEL RÁPIDO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.844310757655741,
    "lng": -77.00039932685678
   },
   {
    "zona": "CARABAYLLO",
    "direccion": "AV. TUPAC AMARU 3493 – P.J. EL PROGRESO (PARTE BAJA) MZ. K LT. 11B ZONA II, CARABAYLLO - LIMA, REF. A UNA CDRA. DEL CRUCE CON LA AV. MANUEL PRADO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.872316361141715,
    "lng": -77.01521214760115
   },
   {
    "zona": "CARABAYLLO",
    "direccion": "AV. JOSÉ SACO ROJAS MZ. A LT. 15 PROGRAMA DE VIVIENDA EL PINO, SAN ANTONIO - CARABAYLLO, REF. FRENTE AL CHIFA HONG FU Y A 3 CUADRAS DEL GRAN MERCADO EL PINO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.858131810981817,
    "lng": -77.04414250346564
   },
   {
    "zona": "CARABAYLLO",
    "direccion": "AV. TUPAC AMARU N? 441 - 443, MZ. O2 LT. 35, REFERENCIA: PARADERO ESTABLO, A UNA CUADRA DE LA URB. SANTA ISABEL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.9035821,
    "lng": -77.0309854
   },
   {
    "zona": "CARABAYLLO",
    "direccion": "AV. A MZ. L2 LT. 20 URB. SANTO DOMINGO – VI ETAPA CARABAYLLO - LIMA, REF. EN EL CRUCE DE LAS AV. CHILLON TRAPICHE Y AV. CAMINO REAL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.873004724827046,
    "lng": -77.0290837822141
   },
   {
    "zona": "CARABAYLLO",
    "direccion": "AV. TRAPICHE MZ. P LT. 48, URB. TUNGASUCA REFERENCIA: AUX. AV. CHIMPU OCLLO CON AUX. CHILLÓN TRAPICHE, A 1 CUADRA DEL MERCADO QATUNA",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.891425542922,
    "lng": -77.044425516811
   },
   {
    "zona": "CERCADO LIMA",
    "direccion": "",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": null,
    "lng": null
   },
   {
    "zona": "CERCADO LIMA",
    "direccion": "JR. RICARDO TRENEMAN N° 920, REFERENCIA: DENTRO DEL LOCAL FARENET",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.046751,
    "lng": -77.054634
   },
   {
    "zona": "CERCADO LIMA",
    "direccion": "AV. TINGO MARÍA N°1252-A - CERCADO DE LIMA - LIMA, REF. A MEDIA CDRA. DEL CRUCE CON JR. GRAL. ORBEGOSO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.0606406907256,
    "lng": -77.0589838666984
   },
   {
    "zona": "CERCADO LIMA",
    "direccion": "AV. NICOLAS DUEÑAS 584 MZ. C LT. 4 – AAHH PRIMERO DE SETIEMBRE, CERCADO DE LIMA – LIMA - LIMA, REF. A MEDIA CDRA. DEL CRUCE CON JR. PEDRO GAREZON",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.041685469771842,
    "lng": -77.06569704398638
   },
   {
    "zona": "CERCADO LIMA",
    "direccion": "JR. PRESBÍTERO GARCÍA VILLON NRO. 560 CERCADO LIMA - LIMA, REF. A LA ALTURA DE LA CDRA. 5 DE AV. OSCAR R. BENAVIDES (EX AV. COLONIAL), EN MEDIO DE LAS AV. GUILLERMO DANSEY Y AV. OSCAR R. BENAVIDES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.04638719585,
    "lng": -77.049473000003
   },
   {
    "zona": "CHORRILLOS",
    "direccion": "AV. LOS FAISANES 420, REFERENCIA: AL COSTADO DE LA TIENDA JOHN HOLDEN",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.176072,
    "lng": -76.998107
   },
   {
    "zona": "CHORRILLOS",
    "direccion": "AV. 12 DE OCTUBRE MZ. A - 03, LT. 02, URB. ARIA - LAS DELICIAS DE VILLA, REF. A DOS CUADRAS DE LA AV. DEFENSORES DEL MORRO (EX AV. HUAYLAS)",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.195888810911,
    "lng": -76.998027663434
   },
   {
    "zona": "CHORRILLOS",
    "direccion": "AV. ALAMEDA SUR 5, CHORRILLOS 15067, REF. CRUCE DE AV. ALAMEDA SUR CONAV. ALAMEDA SAN MARCOS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 10:00 AM A 7:00 PM",
    "lat": -12.19672190971743,
    "lng": -77.01160198642162
   },
   {
    "zona": "CHORRILLOS",
    "direccion": "AV. SANTA ANITA N.° 580, CHORRILLOS - LIMA, REF. AL COSTADO DEL MERCADO SANTA ANITA, CRUCE CON SAN GENARO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.19049228146922,
    "lng": -77.01532743242808
   },
   {
    "zona": "CIENEGUILLA",
    "direccion": "AV. ARTERIAL HUAROCHIRI D MZ. B LT. 19, ASOC. DE VIVIENDAS LAS CUMBRES DE CIENEGUILLA, LIMA, REF. AL COSTADO DE LA TIENDA MASS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.089303982280754,
    "lng": -76.85365371221069
   },
   {
    "zona": "COMAS",
    "direccion": "AV. TUPAC AMARU 5725-5727 - URB. HUAQUILLAY I ETAPA, COMAS - LIMA - LIMA, REF. A MEDIA CDRA. DEL BANCO DE LA NACIÓN",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.945312645665,
    "lng": -77.050549078246
   },
   {
    "zona": "COMAS",
    "direccion": "AV. TUPAC AMARU N° 7837- 7839 MZ. C LT. 010 URB. POPULAR SAN JUAN BAUTISTA I ETAPA, COMAS - LIMA, REF. A UNA CDRA. DE LA ENTRADA DE COLLIQUE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.915107566733,
    "lng": -77.040662268934
   },
   {
    "zona": "COMAS",
    "direccion": "AV. TUPAC AMARU 3184 URB. REPARTICION, COMAS - LIMA - LIMA, REF. A MEDIA CDRA. DE AV. VICTOR ANDRES BELAUNDE Y/O FRENTE A DOLLARCITY",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.939410443955,
    "lng": -77.0500541
   },
   {
    "zona": "COMAS",
    "direccion": "AV. UNIVERSITARIA NORTE MZN. Q1 LTE. 030 URB. PRIMAVERA,COMAS-LIMA - LIMA, REF. A MEDIA CDRA. DEL INGRESO AL PARQUE ZONA SINCHI ROCA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.919995063846647,
    "lng": -77.05093521974257
   },
   {
    "zona": "COMAS",
    "direccion": "AV. UNIVERSITARIA N° 7241, REFERENCIA: EX BOULEVARD DE RETABLO / A 2 CDRAS DEL METRO DE BELAUNDE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.937314524134514,
    "lng": -77.05809407916101
   },
   {
    "zona": "COMAS",
    "direccion": "AV. TRAPICHE 886 A 16 2P 2 - URB. PINAR, REFERENCIA: FRENTE AL COMPLEJO DEPORTIVO WALON",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.91918929266535,
    "lng": -77.06050258466907
   },
   {
    "zona": "EL AGUSTINO",
    "direccion": "AV 1° DE MAYO 3071 - URB HUANCAYO  referencia : FRENTE AL GRIFO REPSOL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.0300919,
    "lng": -76.9991156
   },
   {
    "zona": "EL AGUSTINO",
    "direccion": "JR. ANCASH MZ. B LT. 11 AAHH ANCIETA ALTA, EL AGUSTINO - LIMA - LIMA, REF. FRENTE AL INGRESO DE AGUSTINO PLAZA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.041365477648608,
    "lng": -77.00264283281007
   },
   {
    "zona": "INDEPENDENCIA",
    "direccion": "Av. GERARDO UNGER NRO. 6917 INT. LB 19",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.004946,
    "lng": -77.055867
   },
   {
    "zona": "INDEPENDENCIA",
    "direccion": "Av. GERARDO UNGER NRO. 6917 INT. LB 19",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.004946,
    "lng": -77.055867
   },
   {
    "zona": "INDEPENDENCIA",
    "direccion": "CALLE A, MZ. D LT. 26 URBANIZACIÓN PANAMERICANA (PRIMER PISO) INDEPENDENCIA - LIMA - LIMA, REF. A 1 CDRA. DEL CRUCE CON AV. INDUSTRIAL (LATERAL DE MEGAPLAZA)",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.992650999981887,
    "lng": -77.06030747047947
   },
   {
    "zona": "INDEPENDENCIA",
    "direccion": "AV. TUPAC AMARU N° 4708 - 4710, REF. A UNA CDRA. DEL PARADERO ESTACIÓN NARANJAL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 08:00 AM A 7:00 PM",
    "lat": -11.978882502306485,
    "lng": -77.0591044310316
   },
   {
    "zona": "INDEPENDENCIA",
    "direccion": "CENTRO COMERCIAL MEGA PLAZA AV. ALFREDO MENDIOLA 3698 LIMA - INDEPENDENCIA. REF. PRIMER PISO DE MEGA PLAZA / AL COSTADO DEL ESTACIONAMIENTO DE BICICLETA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 10:00 A.M. A 8:00 P.M.",
    "lat": -11.993286670554024,
    "lng": -77.06326926907906
   },
   {
    "zona": "JESUS MARIA",
    "direccion": "AV. SAN FELIPE 1195 - JESÚS MARÍA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.0822274,
    "lng": -77.0459498
   },
   {
    "zona": "JESUS MARIA",
    "direccion": "AV. ARENALES 391, REFERENCIA: A 2 CDRAS. DE AV. 28 DE JULIO A LA ESPALDA DE LA UTP",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -12.068228,
    "lng": -77.037967
   },
   {
    "zona": "JESUS MARIA",
    "direccion": "AV. MARISCAL LUZURIAGA 584-586 JESÚS MARÍA - LIMA, REF. A CUADRA Y MEDIA DEL PARQUE SAN JOSÉ, PARALELO A LA AV. MELLO FRANCO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.076277049292106,
    "lng": -77.0481659884218
   },
   {
    "zona": "JESUS MARIA",
    "direccion": "CENTRO COMERCIAL REAL PLAZA SALAVERRY, AV. GRAL. SALAVERRY 2370, JESÚS MARÍA 15076, REF. FRENTE A LA ESCUELA DE POSTGRADO UTP",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 11:00 AM A 7:30 PM",
    "lat": -12.089813084346,
    "lng": -77.052643198724
   },
   {
    "zona": "LA MOLINA",
    "direccion": "Av la fontana 440 - La Molina (CC La Rotonda II local 1018)",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.072691,
    "lng": -76.9548488
   },
   {
    "zona": "LA MOLINA",
    "direccion": "AV. LOS FRESNOS 1305 TIENDA 2 - URB. PORTADA DEL SOL I ETAPA - LA MOLINA - LIMA, REF. A 3 CDRAS. DEL ÓVALO DE LOS CÓNDORES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.104084611289,
    "lng": -76.9414167
   },
   {
    "zona": "LA MOLINA",
    "direccion": "AV. LA MOLINA (EXAV. LA UNIVERSIDAD) #3551 TDA -7 MZ. H SUBLOTE 1C, URB. EL SOL DE LA MOLINA I ETAPA LA MOLINA - LIMA, REF. A MEDIA CDRA. DEL CRUCE CON AV. EL SOL",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.085763100386,
    "lng": -76.913409441937
   },
   {
    "zona": "LA MOLINA",
    "direccion": "AV. FLORA TRISTÁN N° 885, URB. SANTA PATRICIA III ETAPA, LA MOLINA - LIMA, REF.  A MEDIA CDRA. DE MOLISALUD",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.064156609712583,
    "lng": -76.9455208508212
   },
   {
    "zona": "LA MOLINA",
    "direccion": "AV. ALAMEDA DEL CORREGIDOR MZ. U LT. 19 UI 1 - URB LA CAPILLA, LA MOLINA - LIMA - LIMA, REF. A 2 CDRAS. DEL CRUCE CON ALAMEDA DE LOS CÓNDORES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.105549936759,
    "lng": -76.946964207289
   },
   {
    "zona": "LA MOLINA",
    "direccion": "AV. LA MOLINA 2448, LA MOLINA 15026, LA MOLINA - LIMA - LIMA, REF. ESTACIONAMIENTO NIVEL -3",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 10:00 AM A 8:00 PM",
    "lat": -12.07532253461305,
    "lng": -76.93612151388963
   },
   {
    "zona": "LA VICTORIA",
    "direccion": "JR. ANTONIO RAYMONDI NRO. 113",
    "telefono": "015007878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.061097830007334,
    "lng": -77.0344310742025
   },
   {
    "zona": "LA VICTORIA",
    "direccion": "AV. CANADÁ 1603, REFERENCIA: ENTRE AV. CANADÁ CON AV. AVIACIÓN",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.0840074,
    "lng": -77.0058111
   },
   {
    "zona": "LA VICTORIA",
    "direccion": "direccion",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": 0,
    "lng": 0
   },
   {
    "zona": "LA VICTORIA",
    "direccion": "AV. MEXICO 1125, LA VICTORIA - LIMA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 9:00 PM",
    "lat": -12.073430785867,
    "lng": -77.01758370586
   },
   {
    "zona": "LA VICTORIA",
    "direccion": "JR. LUNA PIZARRO N° 701 - LA VICTORIA,  REFERENCIA: ESQUINA HIPÓLITO UNANUE",
    "telefono": "01 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.0670586,
    "lng": -77.0273264
   },
   {
    "zona": "LINCE",
    "direccion": "JR. DOMINGO CASANOVA N°318 LINCE - LIMA, REF. CRUCE CON PETIT THOUARS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.089639700017,
    "lng": -77.032406270598
   },
   {
    "zona": "LINCE",
    "direccion": "AV. CORONEL JOSÉ LEAL 648, URB. FUNDO LOBATÓN, LINCE - LINCE, REF. PARALELA A LA CDRA. 6 DE LA AV. CANEVARO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 A.M A 8:00 P.M",
    "lat": -12.085366655704497,
    "lng": -77.04022637039473
   },
   {
    "zona": "LOS OLIVOS",
    "direccion": "AV. LOS PRÓCERES MZ. PP2 LT.21, URB. PUERTAS DE PRO - LOS OLIVOS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.9450493,
    "lng": -77.0775764
   },
   {
    "zona": "LOS OLIVOS",
    "direccion": "AV. PRÓCERES, MZ. 3, LT. 23 A.H. LAURA CALLER - LOS OLIVOS, REFERENCIA: CRUCE ENTRE AV. HUANDOY Y MARAÑÓN",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.970678,
    "lng": -77.080356
   },
   {
    "zona": "LOS OLIVOS",
    "direccion": "AV. HUANDOY MZA. 72 LTE. 54 P.J. P.M.V. “CONFRATERNIDAD” - AAHH. ENRIQUE MILLA OCHOA LOS OLIVOS - LIMA, REF. A UNA CDRA. DEL CRUCE CON AV. CENTRAL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.957822256000819,
    "lng": -77.07594487055076
   },
   {
    "zona": "LOS OLIVOS",
    "direccion": "AV. ALFREDO MENDIOLA 8161 URB. PRO, LOS OLIVOS - LIMA - LIMA, REF. A UNA CDRA. DEL COLEGIO JOSÉ MARÍA ARGUEDAS",
    "telefono": "01 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.933223203028,
    "lng": -77.073028216717
   },
   {
    "zona": "LOS OLIVOS",
    "direccion": "AV. ANGELICA GAMARRA DE LEON VALVERDE N° 621 URB EL TREBOL, LOS OLIVOS - LIMA, REF. A LA ALTURA DEL KFC / CRUCE CON AV. ALFA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.00564059430335,
    "lng": -77.06833392202753
   },
   {
    "zona": "LOS OLIVOS",
    "direccion": "CALLE DAVID ALVA MANZANA H LOTE 4 URB. CAJABAMBA LOS OLIVOS - LIMA, REF. ENTRE LA AV. CARLOS IZAGUIRRE CON LA AV. UNIVERSITARIA (FRENTE AL COLEGIO PAMER)",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.991719564563,
    "lng": -77.080444406224
   },
   {
    "zona": "LOS OLIVOS",
    "direccion": "AV. 2 DE OCTUBRE MZ. H LT. 2 - LOS OLIVOS - PRO, REF. AV. 2 DE OCTUBRE CON AV. CANTA CALLAO, AL COSTADO DEL CENTRO DE SAlUD PRO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.95057177592816,
    "lng": -77.08493089999897
   },
   {
    "zona": "LOS OLIVOS",
    "direccion": "AV. LAS PALMERAS N° 5236 URB. VILLA NORTE - LOS OLIVOS",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.975852939682618,
    "lng": -77.07207437848116
   },
   {
    "zona": "LOS OLIVOS",
    "direccion": "AV. LOS PLATINOS N°. 259, MZ. A - LT. 17, URB. LOTIZACIÓN INDUSTRIAL INFANTAS LOS OLIVOS - LIMA, REF. A DOS CDRAS. Y MEDIA DE LA AV. ALFREDO MENDIOLA Y/O PANAMERICANA NORTE (ALTURA DEL PARADERO CASETA)",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.970038188057043,
    "lng": -77.06456792944489
   },
   {
    "zona": "LURIGANCHO",
    "direccion": "v",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.0164326,
    "lng": -76.912636
   },
   {
    "zona": "LURIGANCHO",
    "direccion": "EL SOL 124 (PARQUE ECHENIQUE) LURIGANCHO - CHOSICA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.933529281206,
    "lng": -76.693335095276
   },
   {
    "zona": "LURIGANCHO",
    "direccion": "HUACHIPA ESTE - MANZANA A18 LOTE 1, 2, 3 CALLE B, CALLE 08, CALLE A, REF. AL COSTADO DE INDUSTRIAS ELÉCTRICAS KBA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.935550288297,
    "lng": -76.868334300939
   },
   {
    "zona": "LURIGANCHO",
    "direccion": "AV. CIRCUNVALACIÓN MZ. A LT. 1 - D C - P SANTA MARÍA DE HUACHIPA - LURIGANCHO - CHOSICA, REF. ENTRE LA AV. CIRCUNVALACIÓN Y LA AV. HUACHIPA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.016439072071643,
    "lng": -76.91240974118337
   },
   {
    "zona": "LURIGANCHO",
    "direccion": "HUACHIPA ESTE - MANZANA A18 LOTE 1, 2, 3 CALLE B, CALLE 08, CALLE A, REF. AL COSTADO DE INDUSTRIAS ELÉCTRICAS KBA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.935550288297,
    "lng": -76.868334300939
   },
   {
    "zona": "LURIN",
    "direccion": "AV. ANTIGUA PANAMERICANA SUR KM 37 MZ C LT 17 - FUNDO LAS SALINAS  - referencia a cuadra y media del mercado virgen de las mercedes.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.2819873,
    "lng": -76.8658386
   },
   {
    "zona": "LURIN",
    "direccion": "ANTIGUA PANAMERICANA SUR, LOTE 2, MZ. B, PRIMER PISO LURÍN - LIMA, REF. A CDRA. Y MEDIA DEL CRUCE CON AV. SANTA CRUZ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.25508377880026,
    "lng": -76.89009010408147
   },
   {
    "zona": "MAGDALENA DEL MAR",
    "direccion": "JR. AYACUCHO N° 756, REFERENCIA: A UNA CDRA. DEL MERCADO MODELO DE MAGDALESY A 3 CDRAS. DE LA IGLESIA CÚPULA DE SUCRE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.086209998877823,
    "lng": -77.07142297178575
   },
   {
    "zona": "MIRAFLORES",
    "direccion": "AV. JOSE PARDO N?533",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.119319117645,
    "lng": -77.034353944233
   },
   {
    "zona": "MIRAFLORES",
    "direccion": "Calle Berlín 219  - Miraflores",
    "telefono": "015007878",
    "horario": "LUNES A VIERNES - 9:00 AM A 6:00 PM",
    "lat": -12.121881114037542,
    "lng": -77.03219965402278
   },
   {
    "zona": "MIRAFLORES",
    "direccion": "AV. ALFREDO BENAVIDES 1851 - MIRAFLORES, REF. AL COSTADO DEL BEMBOS AURORA BENAVIDES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -12.126749176455,
    "lng": -77.013223328823
   },
   {
    "zona": "MIRAFLORES",
    "direccion": "AV. COMANDANTE ESPINAR 330-MIRAFLORES, REF. ENTRE EL CRUCE DE CALLE ENRIQUE PALACIOS Y LA AV. COMANDANTE ESPINAR",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -12.116361361085,
    "lng": -77.036806493898
   },
   {
    "zona": "MIRAFLORES",
    "direccion": "MALECÓN DE LA RESERVA 610, MIRAFLORES 15074, MIRAFLORES - LIMA - LIMA, REF. SÓTANO NIVEL A",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 10:00 AM A 6:00 P.M.",
    "lat": -12.13176251520779,
    "lng": -77.03007421242233
   },
   {
    "zona": "MIRAFLORES",
    "direccion": "AV. ROOSEVELT 6297 (ANTES REP. PANAMÁ) - MIRAFLORES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 9:00 AM A 6:00 PM",
    "lat": -12.12746185891619,
    "lng": -77.01786268247683
   },
   {
    "zona": "PACHACAMAC",
    "direccion": "AV. PROLONGACIÓN DE LA AV. LA MOLINA MZ. E LOTE 21. AH PAUL POBLET LIND, PACHACAMAC - LIMA, REF. A MEDIA CDRA. DE MI BANCO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 7PM",
    "lat": -12.084751211026502,
    "lng": -76.8761664787276
   },
   {
    "zona": "PACHACAMAC",
    "direccion": "AV. VICTOR MALASQUEZ MZ. B LT. 16 – ASOCIACIÓN DE VIVIENDA “EL SOL DE SAN FERNANDO” ZONA 5 – QUEBRADA DE MANCHAY, PACHACÁMAC - LIMA - LIMA, REF. A 2 CDRAS. DEL CRUCE CON AV. UNIÓN",
    "telefono": "01 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.147095887089,
    "lng": -76.871512513949
   },
   {
    "zona": "PACHACAMAC",
    "direccion": "AV. MANUEL VALLE SUB - LOTE 2 - 1, NÚMERO DE PARCELA J, PROYECTO HUERTOS DE PACHACAMAC, VALLE LURÍN - PACHACAMAC - LIMA, REF. FRENTE AL ESTUDIO DE CANAL 4 (AMERICA TELEVISIÓN)",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.232514555328416,
    "lng": -76.86432399999713
   },
   {
    "zona": "PACHACAMAC",
    "direccion": "AV. VICTOR MALASQUEZ MZ. B11 SUB-LOTE 06-A - AAHH CENTRO POBLADO RURAL LOS HUERTOS DE MANCHAY SECTOR B PACHACAMAC - LIMA, REF.  A MEDIA CDRA. DEL PARADERO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.114362937395487,
    "lng": -76.87350734288519
   },
   {
    "zona": "PUEBLO LIBRE",
    "direccion": "AV. BOLIVAR 1097, PUEBLO LIBRE - LIMA, REF. A MEDIA CDRA. DEL CRUCE AV. GRAL. JOSÉ MARÍA EGUSQUIZA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.072414855721524,
    "lng": -77.06500307055026
   },
   {
    "zona": "PUEBLO LIBRE",
    "direccion": "AV. LA MARINA 1640 - REFERENCIA :  A UNA CUADRA DEL CENTRO COMERCIAL PLAZA SAN MIGUEL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.0775694,
    "lng": -77.0799465
   },
   {
    "zona": "PUENTE PIEDRA",
    "direccion": "AV. ANCÓN 678, REF. A LA ESPALDA DEL PRECIO UNO DE FUNDICION",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.830750370122983,
    "lng": -77.11410941944563
   },
   {
    "zona": "PUENTE PIEDRA",
    "direccion": "AV. MIGUEL GRAUÂ MZ. A LT. 07 Y 08 URB. SAN MARTIN DE PORRES, CERCADO PUENTE PIEDRA - LIMA, REF. ESPALDAS DE TOTTUS DE PUENTE PIEDRA",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.8690911986368,
    "lng": -77.0736756180273
   },
   {
    "zona": "PUENTE PIEDRA",
    "direccion": "AV. BUENOS AIRES MZ. D, SUB-LOTE 188E1 ASOCIACIÓN DE POBLADORESMICAELA BASTIDAS, PUENTE PIEDRA - LIMA - LIMA, REF. A 2 CDRAS. DE LA DEMUNA DE PUENTE PIEDRA",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.8466089579004,
    "lng": -77.0980102328854
   },
   {
    "zona": "PUENTE PIEDRA",
    "direccion": "AV. SAN LORENZO MZ C LT 20 - ADP VIRGEN DE COPACABANA, PUENTE PIEDRA - LIMA. REF, A MEDIA CUADRA DEL PARQUE VIRGEN DE COPACABANA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.856723599999995,
    "lng": -77.06764117055229
   },
   {
    "zona": "PUENTE PIEDRA",
    "direccion": "PANAMERICANA NORTE  KM 32.5 , A 1/2  CUADRA DEL PUENTE ARICA  - AL COSTADO DEL GRIFO REPSOL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.8531295,
    "lng": -77.088719
   },
   {
    "zona": "PUNTA HERMOSA",
    "direccion": "CAR. AUTOPISTA PANAMERICANA SUR N° 2001 (KM. 38) INTERIOR H02A - PUNTA HERMOSA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.301470000005098,
    "lng": -76.78319325684035
   },
   {
    "zona": "PUNTA HERMOSA",
    "direccion": "AV. GARCIA RADA MZ.B LT.04, AAHH ASOCIACION DE VIVIENDA Y DESARROLLO INTEGRAL NUEVA GENERACION, PUNTA HERMOSA - LIMA, REF. A UNA CDRA. DEL PARADERO PEATONAL DE PUNTA HERMOSA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.328301119458041,
    "lng": -76.82488673250228
   },
   {
    "zona": "RIMAC",
    "direccion": "Av. Amancaes Nro. 644 urb. Ciudad y campo - Rimac",
    "telefono": "01 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.0220967,
    "lng": -77.0306918
   },
   {
    "zona": "RIMAC",
    "direccion": "SECCIÓN INMOBILIARIA N°2 – PRIMER PISO LT. 11 DE LA MZ. 2, URB. VILLACAMPA RIMAC, REF. A UNA CDRA. DEL CRUCE CON AV. FELIPE ARANCIBIA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.029694115562732,
    "lng": -77.03647277723022
   },
   {
    "zona": "SAN BORJA",
    "direccion": "AV. JAVIER PRADO ESTE N? 1810 - EST. 05 MZ. A - 1 LT. 04",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.088864569703691,
    "lng": -77.00711528847536
   },
   {
    "zona": "SAN BORJA",
    "direccion": "AV. AVIACIÓN 2819, URB. SAN BORJA SUR, REFERENCIA: AL FRENTE DE BEMBOS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.0966861,
    "lng": -77.0021534
   },
   {
    "zona": "SAN BORJA",
    "direccion": "AV. AVIACIÓN 2999, REFERENCIA: A 1 CDRA. DE LA ESTACIÓN DEL TREN SAN BORJA SUR",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.099414,
    "lng": -77.001675
   },
   {
    "zona": "SAN BORJA",
    "direccion": "AV. ANGAMOS ESTE 2521 (EX AV. PRIMAVERA) - CONJUNTO HABITACIONAL LIMATAMBO -  SAN BORJA. REF. CERCA AL CRUCE DE AV. ANGAMOS ESTE CON AV. PRINCIPAL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.111695444371,
    "lng": -77.004615170566
   },
   {
    "zona": "SAN ISIDRO",
    "direccion": "AV. RIVERA NAVARRETE 465, REFERENCIA: CRUCE DE JAVIER PRADO CON RIVERA NAVARRETE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.092087,
    "lng": -77.026871
   },
   {
    "zona": "SAN ISIDRO",
    "direccion": "CALLE 21 785, REFERENCIA: AL COSTADO DEL MINISTERIO DEL INTERIOR",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -12.097055,
    "lng": -77.014892
   },
   {
    "zona": "SAN ISIDRO",
    "direccion": "CALLE LAS BEGONIAS 774 - SAN ISIDRO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 9:00 AM A 6:00 PM",
    "lat": -12.09576161570898,
    "lng": -77.02598394628174
   },
   {
    "zona": "SAN ISIDRO",
    "direccion": "CALLE MIGUEL DASSO 126 - SAN ISIDRO, REF. EN EL CRUCE DE CALLE LEONIDAS YEROVI Y CALLE MIGUEL DASSO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -12.105998898586,
    "lng": -77.040498779467
   },
   {
    "zona": "SAN JUAN DE LURIGANCHO",
    "direccion": "AV. FERNANDO WIESSE MZ. Q LOTE 1 AA.HH. CRUZ DE MOTUPE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.938267731665,
    "lng": -76.975696450097
   },
   {
    "zona": "SAN JUAN DE LURIGANCHO",
    "direccion": "AV. CANTO GRANDE N°. 2570 - URB. GANIMEDES, REFERENCIA: A 3 CDRAS. DE PLAZA VEA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.986444455930926,
    "lng": -77.01549062944763
   },
   {
    "zona": "SAN JUAN DE LURIGANCHO",
    "direccion": "CALLE SAN MARTIN CON AV. COMERCIAL NORTE 189 - SAN JUAN DE LURIGANCHO, REF. A 1/2 CUADRA DE LA AV 6 DE CANTO GRANDE - AL COSTADO DEL PLAY PARK (PARQUE BOLOGNESI)",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.973898198595233,
    "lng": -77.00615208127309
   },
   {
    "zona": "SAN JUAN DE LURIGANCHO",
    "direccion": "AV. MALECÓN CHECA MZ. B LT. 7, URB. CAMPOY, SAN JUAN DE LURIGANCHO, REF. A 1 CDRA. DEL CRUCE DE AV. MALECÓN CHECA CON AV. SAN MARTÍN",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.024684940555957,
    "lng": -76.96870763756485
   },
   {
    "zona": "SAN JUAN DE LURIGANCHO",
    "direccion": "AV. CENTRAL MZ R9 LOTE 3 PROGRAMA CIUDAD MRCAL. CACERES, SECTOR II, BARRIO 3, GRUPO RESIDENCIAL R - SAN JUAN DE LURIGANCHO, REF. EN MEDIO DEL CRUCE CON LAS AV. EL MURO Y AMPLIACION ESTE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.948238651609,
    "lng": -76.97919847596
   },
   {
    "zona": "SAN JUAN DE LURIGANCHO",
    "direccion": "AV. CIRCUNVALACIÓN MZ. B-5 LT. 20 AA. HH. SARGENTO FERNANDO LORES TENAZOA COMUNA 20, SAN JUAN DE LURIGANCHO - LIMA, REF. A DOS CDRAS. DEL COLEGIO RAMIRO PRIALE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.97117157272077,
    "lng": -76.9893916747466
   },
   {
    "zona": "SAN JUAN DE LURIGANCHO",
    "direccion": "PROGRAMA CIUDAD MRCAL. CACERES, SECTOR III MZ. Q8 LT. 11 SAN JUAN DE LURIGANCHO - LIMA, REF. A MEDIA CDRA. DEL CRUCE DE AV. DEL MERCADO CON AV. AMPLIACION OESTE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 A.M A 8:00 P.M",
    "lat": -11.93887049947234,
    "lng": -76.9899343671839
   },
   {
    "zona": "SAN JUAN DE LURIGANCHO",
    "direccion": "AV. MALECÓN MIGUEL CHECA EGUIGUREN N° 167 Y 169 DE LA URB. ZÁRATE, SJL - LIMA, REF. ESQUINA CON AV. GRAN CHIMÚ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.03068626503971,
    "lng": -77.01069288124661
   },
   {
    "zona": "SAN JUAN DE LURIGANCHO",
    "direccion": "AV. SANTA ROSA DE LIMA MZ. D LT. 4 - AAHH 2 DE SETIEMBRE - SAN JUAN DE LURIGANCHO, REF. A TRES CDRAS. DEL CRUCE CON AV. EL SOL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 A.M A 8:00 P.M",
    "lat": -11.98966604407686,
    "lng": -76.99894440000024
   },
   {
    "zona": "SAN JUAN DE LURIGANCHO",
    "direccion": "AV. FERNANDO WIESSE MZ. E8. LOTE 38B, MARISCAL CÁCERES BAYOVAR - SAN JUAN DE LURIGANCHO - LIMA, REF. AUXILIAR PRÓCERES DE LA INDEPENDENCIA, AL FRENTE DE LA UNIVERSIDAD SAN MARCOS – AGROINDUSTRIAL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.952649328006302,
    "lng": -76.9868396646944
   },
   {
    "zona": "SAN JUAN DE LURIGANCHO",
    "direccion": "MZ. B1 LT. 25 URBANIZACIÓN LOS PINOS SAN JUAN DE LURIGANCHO, REF. AV. FERNANDO WIESSE - CERCA A LA ESTACIÓN SAN MARTÍN",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.973859486208,
    "lng": -76.999139704875
   },
   {
    "zona": "SAN JUAN DE LURIGANCHO",
    "direccion": "AV. PRÓCERES DE LA INDEPENDENCIA NRO.  1295 - 1299 REFERENCIA: AL COSTADO DEL BANCO DE LA NACIÓN DE AV. LOS TUSILAGOS OESTE",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.012724544095489,
    "lng": -77.0023639335885
   },
   {
    "zona": "SAN JUAN DE LURIGANCHO",
    "direccion": "AV. 13 DE ENERO Nº2057, URB. SAN HILARIÓN, REFERENCIA: CERCA A LA ESTACIÓN LOS POSTES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.997585,
    "lng": -77.005279
   },
   {
    "zona": "SAN JUAN DE LURIGANCHO",
    "direccion": "Av. Santa Rosa MZ. D1 lote 1 Urb. Los Alamos 2da Etapa  - referencia altura de la cuadra 13 del paradero canto grande",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.965189930601,
    "lng": -76.997693918962
   },
   {
    "zona": "SAN JUAN DE LURIGANCHO",
    "direccion": "JR. CHINCHAYSUYO 468 ZARATE, SAN JUAN DE LURIGANCHO - LIMA, REF. A 1 CDRA. DE TIENDAS 3 A",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 A.M A 8:00 P.M",
    "lat": -12.023579,
    "lng": -77.000722
   },
   {
    "zona": "SAN JUAN DE MIRAFLORES",
    "direccion": "AV. LOS HÉROES 1140 - SJM, REFERENCIA: UNA CDRA. ANTES DEL HOSPITAL MARÍA AUXILIADORA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.158926,
    "lng": -76.960685
   },
   {
    "zona": "SAN JUAN DE MIRAFLORES",
    "direccion": "AV. CANEVARO 336 - A, REF. A 2 CUADRAS DE LA AV. VARGAS MACHUGA  Y A UNA CUADRA DE LA FISCALÍA PROVINCIAL PENAL DE S.J.M.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.166336290865159,
    "lng": -76.9690565560943
   },
   {
    "zona": "SAN JUAN DE MIRAFLORES",
    "direccion": "AV. ALMIRANTE MIGUEL GRAU MZ. Y3 LT. 29,PAMPLONA ALTA - SAN JUAN DE MIRAFLORES - LIMA, REF. A MEDIA CDRA. DEL MERCADO OLLANTAY PAMPLONAALTA",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.1367497811897,
    "lng": -76.9658882149969
   },
   {
    "zona": "SAN JUAN DE MIRAFLORES",
    "direccion": "AV. SAN JUAN MZ. 24 LT. 1, SECT. NUEVO HORIZONTE, PP. JJ PAMPLONA ALTA - SAN JUAN DE MIRAFLORES, REF. A 3 CDRAS. DEL CRUCE CON AV. SALVADOR ALLENDE",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.1462220555428,
    "lng": -76.9669646
   },
   {
    "zona": "SAN JUAN DE MIRAFLORES",
    "direccion": "AV. LOS PRECURSORES MZ. B LT. 17 AA.HH EL INTI, SAN JUAN DE MIRAFLORES - LIMA - LIMA, REF. A 1 CDRA. DEL CRUCE CON AV. LOS PRÓCERES",
    "telefono": "01 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.187290105723,
    "lng": -76.981656592911
   },
   {
    "zona": "SAN JUAN DE MIRAFLORES",
    "direccion": "AV. DE LOS HÉROES N° 228 - SAN JUAN DE MIRAFLORES - (ESTACIÓN ATOCONGO)",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.1518357,
    "lng": -76.9781867
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. PRÓCERES N° 588 URB. COVICEM, REF. A 2 CDRAS. DE TOMÁS VALLE",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.014500655852052,
    "lng": -77.08699865886146
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. CARLOS IZAGUIRRE SUB LT. 8, MZ. C - ASOC. DE VIV. LOS NISPEROS, REFERENCIA: ENTRE AV. 12 DE OCTUBRE Y AV. SANTA ROSA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.99001,
    "lng": -77.09459
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. GERMAN AGUIRRE UGARTE 649 URB. SAN GERMAN - SAN MARTIN DE PORRES, REF. A LA ALTURA DE LA CUADRA 6 DE LA AV. GERMAN AGUIRRE Y A 3 CUADRAS DE AV. TOMAS VALLE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.01520062837,
    "lng": -77.071383204114
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. LOS DOMINICOS 1460 - URB. LOS CIPRESES MZ. Z LT. 4 - SAN MARTÍN DE PORRES, REF. A UNA CDRA. DEL CRUCE CON AV. SANTA ROSA AL LADO DEL MERCADO LOS CIPRESES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.000236699984,
    "lng": -77.101816070595
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. UNIVERSITARIA MZ. D LT. 01 ASOCIACIÓN DE VIVIENDA SAN JUAN DE DIOS, SAN MARTÍN DE PORRES - LIMA - LIMA, REF. A 1 CDRA. DEL CRUCE CON AV. CARLOS IZAGUIRRE",
    "telefono": "01 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.993691495867,
    "lng": -77.08386534618
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. PACASMAYO MZ. A LT. 03 – URB. SANTA FE DE NARANJAL, SAN MARTÍN DE PORRES - LIMA - LIMA, REF. A 3 CDRAS. DEL CRUCE CON AV. EL SOL DE NARANJAL",
    "telefono": "01 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.971120370669,
    "lng": -77.100521064793
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. ALEJANDRO BERTELLO BOLLATI MZ. H LT. 2-A - ASOC. DE VIV. SAN REMO II ETAPA, SAN MARTÍN DE PORRES - LIMA - LIMA, REF. A MEDIA CDRA. DEL CRUCE CON AV. CANTA CALLAO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.995717209191,
    "lng": -77.113550598391
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. CANTA CALLAO MZ. A LT. 3 ASOC. BRISAS SANTA ROSA 1RA ETAPA, REF. A MEDIA CDRA. DEL COLEGIO AMISTAD Y/O A CUATRO CDRAS. DE LA AV. CARLOS IZAGUIRRE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.985684244067,
    "lng": -77.102068570552
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. CANTA CALLAO, MZ. A LT. 3 URB. ARIZONA - 2DA ETAPA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.97783423,
    "lng": -77.09336287
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. CENTRAL MZ. A LT. 07, URB. PROGRAMA DE VIVIENDA LUCERITO DE NARANJAL, SAN MARTÍN DE PORRES - LIMA - LIMA, REF. A 5 CDRAS. DEL CRUCE CON AV. TANTAMAYO",
    "telefono": "01 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.959972288593,
    "lng": -77.091252270512
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. GERARDO UNGER 6475, URB. SANTA LUISA, 1RA ETAPA, S.M.P., REF. ESQUINA CON AV. 22 DE AGOSTO, LÍMITE CON COMAS / A UNA CDRA. Y MEDIA DE LA COMISARIA SANTA LUZMILA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.94597458951921,
    "lng": -77.0665273461935
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. JOSÉ GRANDA 3826 DE LA URB. CONDEVILLA SEÑOR Y VALDIVIESO MZ. M7 LT 20, 2 ETAPA, 2 SECTOR - S.M.P. , REF.  ENTRE AV. CONDEVILLA Y AV. LOS PRÓCERES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.020561244152566,
    "lng": -77.08705644110377
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. JOSE GRANDA 2546 - SAN MARTIN DE PORRES  -LIMA - LIMA, REF. A UNA CDRA. DEL ÓVALO JOSE GRANDA Y AV. UNIVERSITARIA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.026653935000597,
    "lng": -77.07307865890112
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. LIMA 3899 - SMP, REF. A 3 CDRAS. DEL TOTTUS DE QUILCA CON AV. LIMA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -12.028420907156587,
    "lng": -77.0905094113077
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "Av. Perú 1589, San Martin de Porres -  Lima. Referencia: a dos cuadras del CruCe con la Av. Canadá.",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.0327011,
    "lng": -77.0626605
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. UNIVERSITARIA 1619 - URB. MARIA GRACIA DE ANTARES MZ. B LT. 25 – SAN MARTIN DE PORRES - LIMA, REF. FRENTE AL PLAZA VEA DE UNIVERSITARIA CON TOMAS VALLE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.010046601589,
    "lng": -77.081589491522
   },
   {
    "zona": "SAN MARTIN DE PORRES",
    "direccion": "AV. MIGUEL ANGEL N° 235 - URB. FIORI 4TA ETAPA MZ. N-1 LT. 04 U.I N°6, SAN MARTÍN DE PORRES - LIMA, REF. A 1 CDRA. DEL CRUCE CON AV. MARCO POLO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.009873681812502,
    "lng": -77.05573138335198
   },
   {
    "zona": "SANTA ANITA",
    "direccion": "AV. HUAROCHIRÍ MZ. E1 LT. 03 - URB. LOS CEDROS SANTA ANITA, REF. CRUCE DE AV. HUAROCHIRÍ CON AV. SANTA ANA",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.041444176807,
    "lng": -76.952297800037
   },
   {
    "zona": "SANTA ANITA",
    "direccion": "AV. HUAROCHIRI MZ. D8 LT. 13, URB. LOS CEDROS, SANTA ANITA - LIMA, REF. A MEDIA CDRA. DEL CRUCE CON AV. SANTA ROSA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.041806655130582,
    "lng": -76.95260172004053
   },
   {
    "zona": "SANTA ANITA",
    "direccion": "JR. CESAR VALLEJO 302 MZ. B1 LT. 02 URB UNIVERSAL, SANTA ANITA- LIMA-LIMA, REF. A 1 CDRA. DEL CRUCE CON AV. TUPAC AMARU",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.043267502694624,
    "lng": -76.97980031394222
   },
   {
    "zona": "SANTA ANITA",
    "direccion": "AV. SANTA ROSA #147 – URB. SANTA ANITA MZ. B1 LT. 08 UNIDAD INMOBILIARIA N° 1 - SANTA ANITA - LIMA, REF. A UNA CDRA. DE LA CARRETERA CENTRAL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.05226684612813,
    "lng": -76.96148503819886
   },
   {
    "zona": "SANTA ROSA",
    "direccion": "MZ. L 23 URB. COOVITIOMAR,  - SANTA ROSA - LIMA, REF. CRUCE DE INGRESO A SANTA ROSA Y/O AL COSTADO DE IMAGEN DE SANTA ROSA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.785832663255,
    "lng": -77.154776871103
   },
   {
    "zona": "SANTIAGO DE SURCO",
    "direccion": "Calle Barlovento N° 134 REFERENCIA: A 3 CDRAS DE POLVOS ROSADOS, CERCA AL ÓVALO HIGUERETA, surco",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.128290656591,
    "lng": -76.999440079644
   },
   {
    "zona": "SANTIAGO DE SURCO",
    "direccion": "Av. Primavera Nº 120 Tda. A-21 – Urb. Tambo de Monterrico",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.11155055108,
    "lng": -76.992886374212
   },
   {
    "zona": "SANTIAGO DE SURCO",
    "direccion": "AV. PRIMAVERA N° 1314, URB. C.C. MONTERRICO - SURCO, REFERENCIA: CRUCE JR. EL POLO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 9:00 AM A 6:00 PM",
    "lat": -12.11012859255803,
    "lng": -76.97482357045575
   },
   {
    "zona": "SANTIAGO DE SURCO",
    "direccion": "AV. SAN JUAN MZ A LOTE 01 MATEO PUMACAHUA - SURCO, REF. A 2 CUADRAS DE LA AV. TUPAC AMARU ENTRE EL LÍMITE DE CHORRILLOS Y SURCO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.191080022844782,
    "lng": -76.98405895275964
   },
   {
    "zona": "SANTIAGO DE SURCO",
    "direccion": "AV. TOMÁS MARSANO 3767 - SANTIAGO DE SURCO, REF. A MEDIA CUADRA DE LA ESTACIÓN DE TREN AYACUCHO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -12.135804736326572,
    "lng": -76.99589010595446
   },
   {
    "zona": "SANTIAGO DE SURCO",
    "direccion": "AV. SANTIAGO DE SURCO Nº 4348, URBANIZACIÓN LA VIRREYNA, SANTIAGO DE SURCO - LIMA, REF. AL LADO DE INTECI SEDE SURCO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.14075536666277,
    "lng": -76.99291252944776
   },
   {
    "zona": "SANTIAGO DE SURCO",
    "direccion": "AV. PRIMAVERA 264 TDA 187 C.C. CHACARILLA – SANTIAGO DE SURCO - LIMA - LIMA, REF. C.C. CHACARILLA PRIMER PISO (PUERTA PRINCIPAL DEL CENTRO COMERCIAL)",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 9:00 AM A 7:00 PM",
    "lat": -12.111363118043785,
    "lng": -76.9913844045743
   },
   {
    "zona": "SURQUILLO",
    "direccion": "AV REPÚBLICA DE PANAMÁ N° 5115, REFERENCIA: costado del grifo Repsol.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.1155255,
    "lng": -77.01815066
   },
   {
    "zona": "SURQUILLO",
    "direccion": "AV. ARAMBURÚ 808, REFERENCIA: A 2 CDRAS. DE LA AV. PANAMÁ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -12.102527,
    "lng": -77.022326
   },
   {
    "zona": "SURQUILLO",
    "direccion": "LT. 12 MZ. G, AV. PRINCIPAL 995 (EX AV. UNO) URB. LOS SAUCES 2DA ETAPA, SURQUILLO, REF. CRUCE CON A. MANUEL VILLARÁN",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.120399751438,
    "lng": -77.003503247772
   },
   {
    "zona": "VILLA EL SALVADOR",
    "direccion": "AV. CESAR VALLEJO, MZ. F LT. 1 - SECT. 2, REFERENCIA: FRENTE A ESSALUD, AL COSTADO DEL MERCADO VILLA SUR",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.210718983393406,
    "lng": -76.9327330431671
   },
   {
    "zona": "VILLA EL SALVADOR",
    "direccion": "AV. PASTOR SEVILLA SECT. 6 - GP 7 - MZ. A - LOTE 05  - V.E.S., REF. A 2 CUADRAS DEL ÓVALO MARIÁTEGUI CON 3 DE OCTUBRE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.222771994775695,
    "lng": -76.94317697476002
   },
   {
    "zona": "VILLA EL SALVADOR",
    "direccion": "AV. 01DE MAYO 1 SECT GP 23 - A MZ N LOTE 13 - V.E.S., REF. AV. PASTOR SEVILLA CON AV. 1 DE MAYO A 2 CUADRAS DEL HOSPITAL DE LA SOLIDARIDAD POR LA RUTA C",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.197813452067589,
    "lng": -76.95645150975598
   },
   {
    "zona": "VILLA EL SALVADOR",
    "direccion": "av prueba",
    "telefono": "963569570",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.414719927538,
    "lng": -76.992912529448
   },
   {
    "zona": "VILLA EL SALVADOR",
    "direccion": "MZ. B LT. 3 BARRIO 3 SECTOR 2 - 4TA ETAPA - VES, REFERENCIA: POR EL ÓVALO CERRO LOMAS, FRENTE AL COLEGIO VIRGEN DEL ROSARIO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.242278748260654,
    "lng": -76.92582672867127
   },
   {
    "zona": "VILLA MARIA DEL TRIUNFO",
    "direccion": "AV. PACHACUTEC 6779, MZ. N, LT. 20, VILLA MARIA DEL TRIUNFO - REFERENCIA: A UNA CDRA. DEL GRIFO REPSOL LAS CONCHITAS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.208631,
    "lng": -76.9259818
   },
   {
    "zona": "VILLA MARIA DEL TRIUNFO",
    "direccion": "AV. PACHACUTEC N° 3548, REFERENCIA: FRENTE A REAL PLAZA, A 1 CDRA. DE MAYORSA",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.179083535105955,
    "lng": -76.94455568962945
   },
   {
    "zona": "VILLA MARIA DEL TRIUNFO",
    "direccion": "AV. LIMA 2208 JOSÉ GÁLVEZ- VILLA MARÍA  DEL TRIUNFO, REFERENCIA: A DOS CDRAS. DE LA CURVA JOSÉ GÁLVEZ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.226053,
    "lng": -76.908879
   },
   {
    "zona": "VILLA MARIA DEL TRIUNFO",
    "direccion": "AV VILLA MARIA  MZ. G12 LT. 9 - B PS 1 SECT. VILLA MARIA DEL TRIUNFO, REF. AV. VILLA MARIA  A 2 CUADRAS DE LA MUNICIPALIDAD DE VMT Y AL COSTADO DE ESSALUD",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.160054167398743,
    "lng": -76.94150305828285
   },
   {
    "zona": "VILLA MARIA DEL TRIUNFO",
    "direccion": "AV. 26 DE NOVIEMBRE, 1728B - 1728C MZ. 90 SUB LOTE. 19B PUEBLO JOVEN NUEVA ESPERANZA, VILLA MARIA DEL TRIUNFO - LIMA, REF. A 3 CDRAS. DEL MERCADO VIRGEN DE LOURDES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.167552525986567,
    "lng": -76.92398425823932
   }
  ],
  "Huaral": [
   {
    "zona": "CHANCAY",
    "direccion": "PROLONGACIÓN SAN MARTÍN N°403 CHANCAY - REFERENCIA: A UNA CDRA. DE LA AV. PANAMERICANA NORTE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.5643122,
    "lng": -77.2673802
   },
   {
    "zona": "HUARAL",
    "direccion": "AV. JORGE CHAVEZ 647, REFERENCIA: ENTRE LA AV. GRAU Y BOLOGNESI (CERCA AL PARADERO MOTO NATURALES)",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.4922796340686,
    "lng": -77.2052552735911
   }
  ],
  "Barranca": [
   {
    "zona": "BARRANCA",
    "direccion": "JR. ANDRES REYES BUITRON 416. BARRANCA - BARRANCA – LIMA, REF. A 2 CDRS. DEL PARQUE EL OLVIVAR / A MTRS. DE LA CASA DEL MAESTRO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -10.752972858777678,
    "lng": -77.75544507054775
   },
   {
    "zona": "PARAMONGA",
    "direccion": "AV. CENTRAL N° 305 MZ. N1 LT. 17, rEF. URB. MIGUEL GRAU",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -10.673598,
    "lng": -77.815645
   },
   {
    "zona": "SUPE",
    "direccion": "AV. FRANCISCO VIDAL 1120, SUPE - BARRANCA - LIMA, REF. AL COSTADO DE LUBRICENTRO CIRIACO Y MEDIA CDRA. DE LA CRUZ MISIONERA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -10.797690682632263,
    "lng": -77.7110626706071
   }
  ],
  "Oyón": [
   {
    "zona": "CHURIN",
    "direccion": "AV. VÍA DE EVITAMIENTO N° N/S CHURÍN - OYÓN - LIMA, REF. A MEDIA CDRA. DE LA PLAZA DE ARMAS Y DE LA MUNICIPALIDAD",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -10.806834617318,
    "lng": -76.876111099995
   }
  ],
  "Huarochirí": [
   {
    "zona": "SAN ANTONIO",
    "direccion": "AV. SINCHI ROCA MZ. P LT. 16A P lote 16A, AAHH LAS PRADERAS DE JICAMARCA – SECTOR EL CERCADO – ANEXO 22 JICAMARCA – HUAROCHIRI, REF. CERCA AL ARCO PORTON DE JICAMARCA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.931112343934627,
    "lng": -76.96588399999963
   }
  ]
 },
 "Moquegua": {
  "Ilo": [
   {
    "zona": "ILO",
    "direccion": "URB. CIUDAD DEL PESCADOR, MZ. J LT. 18-19, REFERENCIA: A DOS CUADRAS DEL PODER JUDICIAL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -17.646726685783,
    "lng": -71.332508637667
   },
   {
    "zona": "ILO",
    "direccion": "JR. CALLAO PROLONGACIÓN MZ. N, LT. 19 - A, REFERENCIA: A MEDIA CDRA. DE LA COOPERATIVA CUAJONE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -17.644710705275,
    "lng": -71.34212390418
   },
   {
    "zona": "PACOCHA",
    "direccion": "AGRUPACIÓN DE FAMILIAS PUEBLO NUEVO M.Z E2 LT. COM2A SECT. II – ILO - MOQUEGUA, REF. AL COSTADO DEL BANCO BCP",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -17.614692860029,
    "lng": -71.338305548056
   }
  ],
  "Mariscal Nieto": [
   {
    "zona": "MOQUEGUA",
    "direccion": "Av. Santa Fortunata Mz. N5 Lt. 10 Asoc. Villa Moquegua San Antonio. referencia : A una cuadra de la Casa de la Mujer",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -17.2102839,
    "lng": -70.9480949
   },
   {
    "zona": "MOQUEGUA",
    "direccion": "SECTOR QUEBRADA LAS LECHUZAS MOQUEGUA CALLE N°1 MZ H LT. 04, MOQUEGUA - MARISCAL NIETO - MOQUEGUA, REF. QUEBRADA DE LECHUZAS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -17.196494104692,
    "lng": -70.94804437675
   },
   {
    "zona": "MOQUEGUA",
    "direccion": "MZ. C LT. 24 – ASOCIACIÓN CÉSAR VIZCARRA – CENTRO POBLADO CHEN CHEN , MOQUEGUA –MARISCAL NIETO – MOQUEGUA, REF. AL COSTADO DEL OVALO CHEN CHEN",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -17.199167770597,
    "lng": -70.922473397987
   },
   {
    "zona": "MOQUEGUA",
    "direccion": "CALLE LIMA 190 - MARISCAL NIETO - MOQUEGUA, REF. A DOS CUADRAS DEL PARQUE LOS HÉROES/ALAMEDA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -17.194764722676,
    "lng": -70.938348672668
   }
  ]
 },
 "Ayacucho": {
  "Huamanga": [
   {
    "zona": "AYACUCHO",
    "direccion": "AA.HH  COMPLEJO ARTESANAL T1 LT1 - ayacucho  -  rEFERENCIA :  a una cuadra de la puerta 2 del terminal terrestre libertadores de AMÉRICA",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.1349252,
    "lng": -74.2326602
   },
   {
    "zona": "CARMEN ALTO",
    "direccion": "ASENTAMIENTO HUMANO CARMEN ALTO MZ B1 LOTE 9 ZONA II ACUCHIMAY CARMEN ALTO – HUAMANGA- AYACUCHO, REF. A 1 CUADRA DE LA MUNICIPALIDAD DE CARMEN ALTO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.178399652891,
    "lng": -74.220495670554
   },
   {
    "zona": "JESUS NAZARENO",
    "direccion": "JR. JOSÉ MARÍA EGUREN 451 - JESUS NAZARENO - HUAMANGA - AYACUCHO, REF. CRUCE CON JR. MARIANO MELGAR",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.154760305912,
    "lng": -74.214073329448
   },
   {
    "zona": "SAN JUAN BAUTISTA",
    "direccion": "AV. VENEZUELA N° 431 – URB. APROVISA, SAN JUAN BAUTISTA - HUAMANGA - AYACUCHO, REF. ALTURA DEL HOSTAL LA ORIENTAL, CERCA AL SEGURO DE ESSALUD",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.175943594201,
    "lng": -74.199324499991
   }
  ],
  "Huanta": [
   {
    "zona": "HUANTA",
    "direccion": "JR. GERVASIO SANTILLANA N°976 - HUANTA - AYACUCHO. REF, CRUCE CON JR. REVOLUCIÓN",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.937385673235,
    "lng": -74.255491005798
   }
  ]
 },
 "Ica": {
  "Chincha": [
   {
    "zona": "CHINCHA ALTA",
    "direccion": "PROLONGACION LUIS MASSARO  N°247 -  CHINCHA ALTA",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.417292,
    "lng": -76.139622
   },
   {
    "zona": "CHINCHA ALTA",
    "direccion": "CALLE LOS ÁNGELES N° CASA 217 01 - A SIN BARRIIO CERCADO, CHINCHA ALTA - CHINCHA - ICA, REF. A 2 CDRAS. DE LA PLAZA DE ARMAS DE CHNCHA PASANDO ELECTRODUNAS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.416193893866,
    "lng": -76.131554534509
   },
   {
    "zona": "PUEBLO NUEVO",
    "direccion": "AA. HH. LOS ALAMOS, CALLE LOS LAURELES MZ. 17 LT. 11- A, REF. A 2 CDRAS. DE LA POSTA LOS ÁLAMOS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.399703209779,
    "lng": -76.140172536272
   },
   {
    "zona": "SUNAMPE",
    "direccion": "CARR. PANAMERICANA SUR NRO. 198 -B , SIN BARRIO CERCADO SUNAMPE, SUNAMPE - CHINCHA - ICA, REF. ANTIGUA PANAMERICANA SUR FRENTE A LA ENTRADA DE GROCIO PRADO.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.411199184426,
    "lng": -76.161001005329
   }
  ],
  "Pisco": [
   {
    "zona": "PISCO",
    "direccion": "AV. ABRAHAM VALDELOMAR NRO. PUERTA 965 PISCO - PISCO - ICA, REF. A UNA CDRA. POR LA POSTA SAN MARTIN",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.717889589276,
    "lng": -76.207415719224
   },
   {
    "zona": "PISCO",
    "direccion": "C. P. OBLACION VILLA LOS ANGELES MZ.A LT 13 B LA VILLA PISCO-PISCO-ICA, REF. A 100 METROS CON DIRECCIÓN AL SUR DEDL CRUCE PANAMERICANA ANTIGUA C/N AV. FERMÍN TANGÜIS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.714378,
    "lng": -76.153788
   },
   {
    "zona": "SAN CLEMENTE",
    "direccion": "AV. LOS LIBERTADORES GRUPO NÚMERO 1 MZ,91 LOTE 7ª SAN CLEMENTE - PISCO - ICA, REF. LIBERTADORES SEXTA CUADRA,FRENTE DEL GRIFO SANTA ROSA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -13.680502366805,
    "lng": -76.151887445621
   }
  ],
  "Nasca": [
   {
    "zona": "EL INGENIO",
    "direccion": "AV. PRINCIPAL TULIN 204, EL INGENIO - NAZCA - ICA, REF. FREMTE  A A LA PLAZA DE TULIN",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -14.64720106174,
    "lng": -75.07065165982
   },
   {
    "zona": "MARCONA",
    "direccion": "A. H. SAN MARTÍN DE PORRES E-28 SAN JUAN DE MARCONA - NAZCA - ICA, REF. ENTRE EL HOTEL SAN MARTIN Y EL MINIMARKET LANA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -15.372110896808,
    "lng": -75.157416478964
   },
   {
    "zona": "NAZCA",
    "direccion": "EN LA ESQUINA DE LA AV. CIRCUNVALACIÓN CON CALLE S/N, HOY CALLE LAS MERCEDES S/N NASCA - REFERENCIA: AL LADO DE LA IEP JEAN PIAGET",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -14.8252316,
    "lng": -74.9463744
   },
   {
    "zona": "VISTA ALEGRE",
    "direccion": "CARRETERA PANAMERICANA SUR N\\u00b0 906, VISTA ALEGRE - NAZCA -\\u00a0ICA, REF. FRENTE AL AEROPUERTO DE VISTA ALEGRE",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -14.850980032038,
    "lng": -74.957309986507
   }
  ],
  "Ica": [
   {
    "zona": "ICA",
    "direccion": "Pasaje Grau N° 101 San Joaquin - ICA  REFERENCIA : A 1 cdra de Petro Peru",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -14.0643326,
    "lng": -75.7409599
   },
   {
    "zona": "ICA",
    "direccion": "MANZANA B, SUB-LOTE 02 DEL FUNDO LA PALMA ICA, REF. CRUCE DE AV. CUTERVO CON AV. J.J ELIAS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -14.07358570085,
    "lng": -75.731736729448
   },
   {
    "zona": "ICA",
    "direccion": "AV. MANUEL SANTANA CHIRI N°359 A1 – ICA, REF. CRUCE CON CALLE BALTAZAR CARAVEDO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -14.075173411545,
    "lng": -75.723226190124
   },
   {
    "zona": "LA TINGUINA",
    "direccion": "CALLE FRANCISCO SALES SOTELO N° 298 SUB LOTE 3, LA TINGUIÑA - ICA – ICA, REF. CRUCE DE LA AV.FRNCISCO SALES SOTELO Y AV. JOSE CARLOS MARIATEGUI",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -14.039900990771,
    "lng": -75.711601465608
   },
   {
    "zona": "PARCONA",
    "direccion": "CP. DE PARCONA -CERCADO (PRIMERA ETAPA) MZ. B LOTE 16 PARCONA - ICA, REF. AV. 18 DE FEBRERO Y CRUCE DE AV. NATIVIDAD PACO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -14.0474001492,
    "lng": -75.708398960386
   },
   {
    "zona": "SALAS",
    "direccion": "SUB LOTE 01 ZONA PANAMERICANA SUR KM. 293.350, SALAS GUADALUPE -  ICA - ICA, REF. FRENTE AL ESTADIO DE SALAS GUADALUPE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.988307260089,
    "lng": -75.771832996982
   },
   {
    "zona": "SANTIAGO",
    "direccion": "CENTRO POBLADO SANTIAGO MZ. E, LT. 01 SECTOR II SANTIAGO - ICA - ICA, REF. FRENTE A LA COMISARIA DE SANTIAGO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -14.184709950323,
    "lng": -75.714393999999
   },
   {
    "zona": "SUBTANJALLA",
    "direccion": "C.P - SECTOR MACACONA /PREDIO PARCELA 214 LOTE 2, SUBTANJALLA - ICA - ICA, REF. PANAMERICANA SUR FRENTE A LA ENTRADA DEL ARRABAL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -14.035221650519,
    "lng": -75.75583767055
   }
  ]
 },
 "Junín": {
  "Huancayo": [
   {
    "zona": "CHILCA",
    "direccion": "JR. 28 DE JULIO N° 935, REF. ESQUINA 28 DE JULIO Y SANTOS CHOCANO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.084192324029,
    "lng": -75.202691995668
   },
   {
    "zona": "CHILCA",
    "direccion": "JR. LEONICO PRADO 656, CHILCA – HUANCAYO - JUNÍN REFERENCIA: ESQUINA CON JIRON JOSE OLAYA",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 AM",
    "lat": -12.075860337839,
    "lng": -75.196962163462
   },
   {
    "zona": "EL TAMBO",
    "direccion": "AV MARISCAL CASTILLA 2769  RefERENCIA : Frente al colegio Andres bello",
    "telefono": "(01) 500 - 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.0428748,
    "lng": -75.2267209
   },
   {
    "zona": "EL TAMBO",
    "direccion": "Jr Tarma Nro. 37 - 24, EL TAMBO - HUANCAYO - JUNÍN REF. AL COSTADO DE LA FACULTaD DE INGENIERÍA  METALÚRGICA UNCP",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.030532662807,
    "lng": -75.235135251462
   },
   {
    "zona": "EL TAMBO",
    "direccion": "AV. CIRCUNVALACIÓN 480 T-1, EL TAMBO - HUANCAYO - JUNIN, REF. ESQUINA CON PROLONGACIÓN MARIATEGUI",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.049266655779,
    "lng": -75.210464658895
   },
   {
    "zona": "EL TAMBO",
    "direccion": "AV. HUANCAVELICA 1201, EL TAMBO - HUANCAYO - JUNÍN, REF. ESQUINA CON EL JR. LA VICTORIA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.059666604967,
    "lng": -75.221244266004
   },
   {
    "zona": "HUANCAYO",
    "direccion": "AV. FERROCARRIL S/N - HUANCAYO - COUNTER N° 14, REF. TERMINAL TERRESTRE LOS ANDES, FRENTE AL OPEN PLAZA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.061289165519,
    "lng": -75.20892492023
   },
   {
    "zona": "HUANCAYO",
    "direccion": "JR. ICA Nº 1143 - HUANCAYO, REFERENCIA: ENTRE EL JR. ICA Y EL JR. TACNA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.0739582,
    "lng": -75.2141862
   },
   {
    "zona": "HUANCAYO",
    "direccion": "PJ. SAN FERNANDO 209 HUANCAYO - HUANCAYO - JUNIN, REF. ESQUINA DEL JR. SAN FERNANDO Y MÁRTIRES DEL PERIODISMO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.054983032705,
    "lng": -75.201461670555
   },
   {
    "zona": "HUANCAYO",
    "direccion": "Av. Evitamiento s/n - counter N°13",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.048505844253611,
    "lng": -75.23572860354552
   },
   {
    "zona": "PILCOMAYO",
    "direccion": "PLAZA INDEPENDENCIA 131, PILCOMAYO - HUANCAYO - JUNÍN, REF. PLAZA PRINCIPAL DE PILCOMAYO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.054989295684,
    "lng": -75.254161844677
   },
   {
    "zona": "SAN AGUSTIN",
    "direccion": "CARRETERA CENTRAL KM 7.5 S/N SAN AGUSTIN – HUANCAYO – JUNÍN, REF. FRENTE A LA ENVASADORA SOLGAS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.010163420625,
    "lng": -75.246695070583
   }
  ],
  "Satipo": [
   {
    "zona": "MAZAMARI",
    "direccion": "JR. JORGE CHAVEZ NRO 144 LT. 8A JUNÍN - SATIPO– MAZAMARI, REF. CERCA A LA VÍA PRINCIPAL, AL COSTADO DEL HOSPEDAJE LUJÁN 1ER PISO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.328194232542,
    "lng": -74.532861406404
   },
   {
    "zona": "PANGOA",
    "direccion": "AV. MARGINAL S/N NÚMERO VILLA CHAVINI PANGOA - SATIPO - JUNÍN, REF. AL COSTADO DE LA TIENDA HONDA INVERSIONES ARAUCO SAN MARTÍN DE PANGOA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.419797368222,
    "lng": -74.489787911117
   },
   {
    "zona": "SATIPO",
    "direccion": "JR. FRANCISCO IRAZOLA 1077 - JUNÍN , REF. FÁBRICA LA SATIPEÑA",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.259616493652,
    "lng": -74.64248165158
   }
  ],
  "Chanchamayo": [
   {
    "zona": "BAJO PICHANAQUI",
    "direccion": "AV. VENUS LT. 20 CIUDAD SATÉLITE - REF. ( A 1 CUADRA Y MEDIA DEL PARQUE DE SATÉLITE)",
    "telefono": "015007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -10.919270732705,
    "lng": -74.878801
   },
   {
    "zona": "LA MERCED",
    "direccion": "AV. PERU 931 SECTOR PAMPA DEL CARMEN, LA MERCED  -CHANCHAMAYO - JUNÍN, REF. FRENTE A LA COOPERATIVA CHANCHAMAYO",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.070138136554,
    "lng": -75.336406736317
   },
   {
    "zona": "PERENE",
    "direccion": "AV. MARGINAL S/N AA.VV SAN JACINTO - PERENE - CHANCHAMAYO - JUNIN, REF. ANTES DEL ULTIMO ROMPEMUELLE DE SAN JACINTO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -10.949521894979,
    "lng": -75.223239171096
   },
   {
    "zona": "SAN RAMON",
    "direccion": "JR. UCAYALI 102 - SAN RAMÓN, REFERENCIA: FRENTE A LA CAJA HUANCAYO Y EL PARQUE EL AVIÓN",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.124126,
    "lng": -75.355581
   }
  ],
  "Tarma": [
   {
    "zona": "TARMA",
    "direccion": "JR. AMAZONAS NRO. 1164 TARMA - JUNÍN, REF. ENTRE JR. AMAZONAS CON AV. VIENRICH",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.417779771838,
    "lng": -75.693027799999
   }
  ],
  "Yauli": [
   {
    "zona": "LA OROYA",
    "direccion": "AV. ARÉVALO S/N (CARRETERA CENTRAL) - ANEXO EL TAMBO - SANTA ROSA DE SACCO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.5707657,
    "lng": -75.9586329
   }
  ],
  "Concepción": [
   {
    "zona": "CONCEPCION",
    "direccion": "CARRETERA CENTRAL LT. 7 - MZ. E5, CONCEPCIÓN - CONCEPCIÓN - JUNÍN, REF. ESQUINA CON TUPAC AMARU",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.918185909992,
    "lng": -75.322057252364
   }
  ],
  "Chupaca": [
   {
    "zona": "CHUPACA",
    "direccion": "JR. RAMON CASTILLA 201, CHUPACA - CHUPACA - JUNIN, REF. A UNA CDRA. DE LA PLAZA PRINCIPAL DE CHUPACA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.061264754772,
    "lng": -75.286272902005
   }
  ],
  "Jauja": [
   {
    "zona": "JAUJA",
    "direccion": "Jr. ESTANISLAO MARQUEZ 286, YAUYOS - JAUJA - JUNÍN, REF. ESQUINA CON JR. 4 DE ENERO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.785629433895,
    "lng": -75.493856236131
   },
   {
    "zona": "JAUJA",
    "direccion": "JR.LUIS BARDALES S/N, JAUJA – JAUJA – JUNÍN, REF. TERMINAL TERRESTRE HATUN XAUXA",
    "telefono": "01 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.772218425795,
    "lng": -75.492098458891
   }
  ]
 },
 "Lambayeque": {
  "Chiclayo": [
   {
    "zona": "CHICLAYO",
    "direccion": "AV. PANAMERICANA 975 PP JJ LUIS ALBERTO SANCHEZ, CHICLAYO - CHICLAYO - LAMBAYEQUE, REF. A MEDIA CDRA. DEL OVALO SEÑOR DE SIPAN / AL FRENTE DE DERCO CENTER",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.7587235317862,
    "lng": -79.862861099996
   },
   {
    "zona": "CHICLAYO",
    "direccion": "CALLE. TACNA N° 1095 -CHICLAYO- CHICLAYO - LAMBAYEQUE, REF. INTERSECCIÓN CON AV. JOSE QUIÑONES / A ESPALDAS DEL SUPERMERCADO MAKRO CHICLAYO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.7740292479815,
    "lng": -79.833500386476
   },
   {
    "zona": "CHICLAYO",
    "direccion": "AV. LAS AMÉRICAS LT. 42 MZ. D, URB. MONTERRICO - I ETAPA, CHICLAYO - CHICLAYO - LAMBAYEQUE, REF. A MEDIA CDRA. ENTRE LA AV. COLECTORA Y AV. LAS AMERICAS Y A MEDIA CDRA. DEL GRIFO SR. DE SIPÁN",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.7805011639111,
    "lng": -79.852166441757
   },
   {
    "zona": "CHICLAYO",
    "direccion": "Aeropuerto Internacional Capitán FAP José Abelardo Quiñones Gonzáles",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": null,
    "lng": null
   },
   {
    "zona": "CHONGOYAPE",
    "direccion": "AV. ATAHUALPA N° 1200 - CHONGOYAPE - CHICLAYO - LAMBAYEQUE, REF. INTERSECCION CON CALLE IQUITOS / A 2 CDRAS. DE LA INTERSECCION CON LA AV. CHICLAYO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -6.6378895883335,
    "lng": -79.391862272577
   },
   {
    "zona": "JOSE LEONARDO ORTIZ",
    "direccion": "CALLE TAHUANTINSUYO 995 - URB. SAN LORENZO - JOSE LEONARDO ORTIZ - CHICLAYO - LAMBAYEQUE, REF. ENTRE LA CDRA. 2 DE AV. AMÉRICA Y LA CALLE TAHUANTINSUYO/A MEDIA CDRA. DE LA IGLESIA LOS MORMONES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.7606203740115,
    "lng": -79.841664422679
   },
   {
    "zona": "JOSE LEONARDO ORTIZ",
    "direccion": "AV. JOSE BALTA N° 3653 C.P.M. PRIMERO DE MAYO JOSE LEONARDO ORTIZ -CHICLAYO -LAMBAYEQUE, REF. ENTRE LA AV. BALTA Y NÉSTOR BARSALLO / A 2 CUADRAS DE LA AV. CHICLAYO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.7475994398994,
    "lng": -79.836109469451
   },
   {
    "zona": "LA VICTORIA",
    "direccion": "av. VÍCTOR RAUL HAYA DE LA TORRE 2470 La Victoria - Chiclayo  REFERENCIA : ENTRE LA VIA EVITAMIENTO Y PANAMERICANA",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.8003757,
    "lng": -79.830527
   },
   {
    "zona": "MONSEFU",
    "direccion": "AV. VENEZUELA N° 221, MONSEFÚ - CHICLAYO - LAMBAYEQUE, REF. REF 01: A MEDIA CDRA. DE LA CALLE DIEGO FERRE Y A CDRA. Y MEDIA DEL PARQUE ARTESANAL DE MONSEFÚ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.8800297971621,
    "lng": -79.868249329452
   },
   {
    "zona": "PATAPO",
    "direccion": "AV. CHONGOYAPE N° S/N SECTOR CERRO MIRADOR, PATAPO - CHICLAYO - LAMBAYEQUE, REF. A UNA CDRA. Y MEDIA DE LA INTERSECCIÓN CON AV TRAPICHE / AL FRENTE DEL POLIDEPORTIVO DEL CERRO MIRADOR",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -6.7394168760271,
    "lng": -79.637638965613
   },
   {
    "zona": "PIMENTEL",
    "direccion": "CALLE MIGUEL GRAU MZ B LOTE 3 - PIMENTEL - CHICLAYO - LAMBAYEQUE, REF. AL COSTADO DE LA COMISARIA DE PIMENTEL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.8347500905235,
    "lng": -79.935907463187
   },
   {
    "zona": "POMALCA",
    "direccion": "CALLE 25 MZ. I LT. 6 SECT. 6 SAN JUAN, POMALCA - CHICLAYO - LAMBAYEQUE, REF. A UNA CDRA. Y MEDIA DE LA INTERSECCIÓN CON AV. SAN MARTIN/ AL FRENTE DE LA IGLESIA MORMON",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -6.7680844845415,
    "lng": -79.780749746733
   },
   {
    "zona": "REQUE",
    "direccion": "AV. MARISCAL RAMON CASTILLA MZ. 4 LOTE 14, REQUE - CHICLAYO - LAMBAYEQUE, REF. A MEDIA CDRA. DE LA INTERSECCION CON CALLE SAN MARTIN / A UNOS MTRS DE ALBORADA EVENTOS Y RECEPCIONES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.8670559848257,
    "lng": -79.816861574083
   },
   {
    "zona": "TUMAN",
    "direccion": "AV. CHOTA N° 288 SECTOR ACAPULCO, TUMAN - CHICLAYO - LAMBAYEQUE, REF. AL COSTADO DEL RESTAURANT MANOS CHOTANAS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.7435012497878,
    "lng": -79.697416401677
   }
  ],
  "Ferreñafe": [
   {
    "zona": "FERRENAFE",
    "direccion": "AV. ANDRÉS A. CÁCERES N°550A, REFERENCIA: AL COSTADO DEL GRIFO PRIMAX",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.646179,
    "lng": -79.790525
   }
  ],
  "Lambayeque": [
   {
    "zona": "JAYANCA",
    "direccion": "CALLE DIEGO FERRE N°1321 - JAYANCA - LAMBAYEQUE, REF. AL FRENTE DEL CENTRO DE SALUD DE JAYANCA / A MEDIA CDRA. DEL GRIFO ASIA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -6.384834348558,
    "lng": -79.818776772611
   },
   {
    "zona": "LAMBAYEQUE",
    "direccion": "AV. FEDERICO VILLARREAL N° 491, LAMBAYEQUE - LAMBAYEQUE - LAMBAYEQUE, REF. A MEDIA CDRA. DE LA INTERSECCION DE LA AV. FEDERICO VILLARREAL CON CALLE EMILIANO NIÑO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.7051384276932,
    "lng": -79.909416873063
   },
   {
    "zona": "LAMBAYEQUE",
    "direccion": "CALLE PARAGUAY MZ. D LT 2A UNIDAD VECINAL INDOAMÉRICA - LAMBAYEQUE, REF. AL COSTADO DE LA FÁBRICA DE KINKONES BRUNING / A 01 CUADRA DEL PUENTE LAMBAYEQUE",
    "telefono": "O1 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.6950640309514,
    "lng": -79.903733032828
   },
   {
    "zona": "MORROPE",
    "direccion": "CALLE TAHUANTINSUYO N° 821, MORROPE - LAMBAYEQUE, REF. FRENTE AL PARQUE INFANTIL DE MORROPE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -6.543444405424585,
    "lng": -80.01232827124002
   },
   {
    "zona": "MOTUPE",
    "direccion": "AV. EL MAESTRO N° 447 - MOTUPE - LAMBAYEQUE- LAMBAYEQUE, REF. EN LA CARRETERA FERNANDO BELAUNDE TERRY (PANAMERICANA NORTE) / AL FRENTE DEL GRIFO AVA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.1564451082616,
    "lng": -79.704861209008
   },
   {
    "zona": "OLMOS",
    "direccion": "AV. AUGUSTO B. LEGUÍA MZ. 87 LT. 32  - OLMOS - LAMBAYEQUE, REF. AL FRENTE DE LA COMISARIA DE OLMOS.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.9871924350643,
    "lng": -79.743017122659
   },
   {
    "zona": "TUCUME",
    "direccion": "AV. FEDERICO VILLARREAL N° 982 (CTRA. FERNANDO BELAUNDE TERRY), REFERENCIA: A MEDIA CDRA. DEL CEMENTERIO JARDINES DE LA PAZ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.5041100012906,
    "lng": -79.859217670553
   }
  ]
 },
 "Huánuco": {
  "Huánuco": [
   {
    "zona": "AMARILIS",
    "direccion": "JR. LOS PINOS LOTE 3 -D2 URB LOS PINOS - AMARILIS - HUÁNUCO, REF. A LA ESPALDA DE TOYOTA HUÁNUCO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.9139073583669,
    "lng": -76.233213644157
   },
   {
    "zona": "HUANUCO",
    "direccion": "Jr. Aguilar N° 872 -  Huánuco",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.933953,
    "lng": -76.240018
   }
  ],
  "Leoncio Prado": [
   {
    "zona": "JOSE CRESPO Y CASTIL",
    "direccion": "JR. CHICLAYO 247 0C-02 CENT AUCAYU, LEONCIO PRADO, HUÁNUCO, REF. ATRÁS DEL ESTADIO MUNICIPAL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.9322596556481,
    "lng": -76.112530146816
   },
   {
    "zona": "RUPA RUPA",
    "direccion": "CALLE ROSARIO CENTRAL, REFERENCIA: SEGUNDA ENTRADA DE BUENOS AIRES, EN LA MISMA ESQUINA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.3212843,
    "lng": -75.9933975
   },
   {
    "zona": "RUPA RUPA",
    "direccion": "AV. TITO JAIME 914, RUPA RUPA-  LEONCIO PRADO - HUANUCO, REF. A DOS CDRAS. DE LA PLAZA DE ARMAS LEONCIO PARDO",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.2920534325924,
    "lng": -75.997412332603
   }
  ],
  "Ambo": [
   {
    "zona": "AMBO",
    "direccion": "AV. LAS AMERICAS 501, REF. AL FRENTE DEL COLEGIO JUAN JOSÉ CRESPO Y CASTILLO",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -10.120588660119,
    "lng": -76.206691676387
   }
  ]
 },
 "Puno": {
  "San Román": [
   {
    "zona": "JULIACA",
    "direccion": "Jr. Mama Ocllo 915 - B ( Cruce con Jr Azángaro )",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -15.490571,
    "lng": -70.119498
   },
   {
    "zona": "JULIACA",
    "direccion": "JR. PORVENIR N° 228 URB. LAS MERCEDES, SAN ROMAN - PUNO, REF. A UNA CDRA. DE LA AV. CIRCUNVALACION OESTE - A UNA CDRA. DEL TERMINAL LAS MERCEDES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -15.483920800815,
    "lng": -70.141390859993
   },
   {
    "zona": "JULIACA",
    "direccion": "AV. LAMPA MZ. B2 LT. 3 URB. SANTA ADRIANA, JULIACA - SAN ROMÁN - PUNO, REF. A MEDIA CDRA. DE LA POSTA DE SALUD DE LA URB. SANTA ADRIANA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -15.483557842074,
    "lng": -70.15544291753
   },
   {
    "zona": "JULIACA",
    "direccion": "AV. MODESTO BORDA MZ. A LT. 04 URB. ARRABAL DON JULIO, JULIACA - SAN ROMAN - PUNO, REF. DOS CDRAS. ANTES DEL GRIFO BLANCO / A DOS CDRAS. DEL SALON DE EVENTOS PARAISO AZUL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -15.507584214102,
    "lng": -70.108751042171
   },
   {
    "zona": "JULIACA",
    "direccion": "AV. INDEPENDENCIA NRO. 1538 MZ. A1 LT. 04 URB. HORACIO ZEBALLOS GAMEZ, JULIACA - SAN ROMÁN - PUNO, AL FRENTE DEL GRIFO SAN CARLOS / CRUCE CON JR 21 DE ENEROREF.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -15.467833299999,
    "lng": -70.137583970548
   },
   {
    "zona": "JULIACA",
    "direccion": "JR. AGUSTIN GAMARRA MZ. R1 LT. 09 URB. HUANCANE, JULIACA - SAN ROMÁN - PUNO, REF. A UNA CDRA. DE LA AV. HUANCANE / CRUCE CON JR. ALBERTO CUENTAS ZABALA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -15.473583959348,
    "lng": -70.112417233275
   },
   {
    "zona": "JULIACA",
    "direccion": "AV. HÉROES DE LA GUERRA DEL PACIFICO KM 3.5, JULIACA - SAN ROMÁN - PUNO, REF. AL FRENTE DEL GRIFO LEON SERVICE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -15.507667505495,
    "lng": -70.165000342215
   },
   {
    "zona": "JULIACA",
    "direccion": "JR. SILLUSTANI N° 202, SAN ROMAN - JULIACA, REF. A 3 CDRAS. DEL HOSPITAL CARLOS MONGE MEDRANO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -15.480556232291,
    "lng": -70.117833304412
   },
   {
    "zona": "JULIACA",
    "direccion": "Aeropuerto Internacional Inca Manco Capac",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": null,
    "lng": null
   }
  ],
  "Puno": [
   {
    "zona": "PUNO",
    "direccion": "AV. COSTANERA N° 211 CON JR. LOS INCAS - PUNO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -15.834283484814,
    "lng": -70.018396968946
   },
   {
    "zona": "PUNO",
    "direccion": "URB. AZIRUNI TEPRO I ETAPA MZ. 18 LT. 52 JR LOS ROSALES – SALCEDO PUNO, REF. A UNA CDRA. DE LA AV. ESTUDIANTE / A DOS CDRAS. DE SENATI PUNO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -15.871121071441,
    "lng": -69.996589930673
   },
   {
    "zona": "PUNO",
    "direccion": "URB. SAN PEDRO-ALTO PUNO, AV LA CULTURA N° 160, PUNO - PUNO - PUNO, REF. A TRES CDRAS. DE LA AV. QUE VA A JULIACA / A DOS CDRAS. DEL GRIFO BRONCO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -15.817227035489,
    "lng": -70.0309222
   },
   {
    "zona": "PUNO",
    "direccion": "AV. 4 DE NOVIEMBRE N° 474-B Y 486-B BARRIO SANTA ROSA, PUNO - PUNO – PUNO, REF. A UNA CDRA. DE SUNAFIL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -15.855167345042,
    "lng": -70.015778470551
   }
  ],
  "El Collao": [
   {
    "zona": "ILAVE",
    "direccion": "JR. BOLOGNESI NRO. 866 BARRIO CRUZANI, EL COLLAO - PUNO, REF. A UNA CUADRA DEL COLISEO Y DEL CEMENTERIO DE ILAVE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.082861100001,
    "lng": -69.644722199963
   }
  ],
  "Melgar": [
   {
    "zona": "AYAVIRI",
    "direccion": "JR. SANTA ROSA PROLONGACIÓN S/N MAGISTERIAL - PUNO - MELGAR - AYAVIRI, REF. A 50 METROS DEL ÓVALO, SALIDA A JULIACA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -14.886554,
    "lng": -70.598362
   }
  ],
  "Azángaro": [
   {
    "zona": "AZANGARO",
    "direccion": "AV. PRÓCERES S/N, AZÁNGARO - PUNO, REF. A DOS CDRAS. DEL PARQUE DE LA MADRE / A ORILLAS DE LA MISMA AV. PROCERES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -14.917112408676,
    "lng": -70.198471956773
   }
  ],
  "Chucuito": [
   {
    "zona": "DESAGUADERO",
    "direccion": "AV. PANAMERICANA N° 1158 - 1160, DESAGUADERO - CHUCUITO - PUNO, REF. AL COSTADO DEL GRIFO BARTOLOMÉ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -16.554333203811,
    "lng": -69.042694052504
   }
  ]
 },
 "Tacna": {
  "Tacna": [
   {
    "zona": "CIUDAD NUEVA",
    "direccion": "CIUDAD NUEVA MZ 46 LT 12 COMITÉ 10 CIUDAD NUEVA - TACNA, REF. A UNA CDRA. DE LA PLAZA JOSÉ OLAYA DE CIUDAD NUEVA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -17.984471588057,
    "lng": -70.236055095903
   },
   {
    "zona": "CORONEL GREGORIO ALBARRACIN LANCHIPA",
    "direccion": "ASOC. VILLA SAN FRANCISCO MZ. 94 LT. 22, REFERENCIA: CERCA A CAJA CUSCO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -18.047103237436,
    "lng": -70.255889232014
   },
   {
    "zona": "CORONEL GREGORIO ALBARRACIN LANCHIPA",
    "direccion": "ASOCIACIÓN LAS VILCAS  MZ. E LT. 16, GREGORIO ALBARRACÍN LANCHIPA - TACNA REF. FRENTE AL MERCADO HÉROES DEL CENEPA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -18.033417923278,
    "lng": -70.250918108114
   },
   {
    "zona": "CORONEL GREGORIO ALBARRACIN LANCHIPA",
    "direccion": "PROMUVI VIÑANI, AMP. I ETAPA, MZ. 574, LT. 09 – CORONEL GREGORIO ALBARRACÍN LANCHIPA – TACNA - TACNA, REF. A MEDIA CDRA. DEL ÓVALO LOS MOLLES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -18.062945787541,
    "lng": -70.251860014921
   },
   {
    "zona": "TACNA",
    "direccion": "Av. Jorge Basadre Grohmann Oeste n° 366 - tACNA",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -18.014034875512,
    "lng": -70.259915218194
   },
   {
    "zona": "TACNA",
    "direccion": "AV. VIGIL 1636, REFERENCIA: A UNA CDRA. DE LA PLAZA GRAU",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -17.999550724531,
    "lng": -70.239101658895
   },
   {
    "zona": "TACNA",
    "direccion": "CALLE ARIAS ARAGUEZ N° 836  TACNA, REF. A UNA CDRA. ANTES DE LLEGAR AL COLISEO PERÚ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -18.006778378004,
    "lng": -70.252973965232
   },
   {
    "zona": "TACNA",
    "direccion": "AV. LITORAL NRO. 306 – PARA CHICO (ANTERIOR AV. EJÉRCITO PROLONGACIÓN 306 TACNA), TACNA - TACNA - TACNA, REF. DENTRO DEL ESTABLECIMIENTO DEL GRIFO PRIMAX",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -18.029249633968,
    "lng": -70.274333272827
   },
   {
    "zona": "TACNA",
    "direccion": "PUEBLO TRADICIONAL POCOLLAY MZ. T LOTE 01 , POCOLLAY - TACNA - TACNA, REF. A UNA CDRA. DEL CENTRO DE SALUD POCOLLAY",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -17.993277680713,
    "lng": -70.218443730944
   },
   {
    "zona": "TACNA",
    "direccion": "Aeropuerto Internacional Coronel Carlos Ciriani Santa Rosa",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": null,
    "lng": null
   }
  ]
 },
 "Piura": {
  "Talara": [
   {
    "zona": "EL ALTO",
    "direccion": "AV. BOLOGNESI O-37 CENTRO EL ALTO, REFERENCIA: A ESPALDAS DE LA MUNICIPALIDAD DE EL ALTO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -4.268178,
    "lng": -81.221744
   },
   {
    "zona": "LOS ORGANOS",
    "direccion": "Av. Panamericana Norte P-29 - URB. Cercado zona URBANA,  Referencia al frente de grifo de troncos o grifo San Pedro",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -4.1747753095423,
    "lng": -81.123411684872
   },
   {
    "zona": "MANCORA",
    "direccion": "AV. GRAU NRO. 432 MÁNCORA - TALARA - PIURA, REF. FRENTE AL PARADERO DE AUTOS DE LOS ÓRGANOS EN TODA LA PANAMERICANA NORTE.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -4.1067198549527,
    "lng": -81.048832633167
   },
   {
    "zona": "PARINAS",
    "direccion": "ASOCIACIÓN CALIFORNIA C - 03 FRENTE A CARRETERA NEGRITOS, TALARA - PARIÑAS, REFERENCIA: AL COSTADO DEL RESTAURANTE MI TORETE",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -4.5895156321892,
    "lng": -81.27349917493
   },
   {
    "zona": "PARINAS",
    "direccion": "MZ. N-10 AA.HH 9 DE OCTUBRE TALARA ALTA, PARIÑAS - TALARA - PIURA, REF. A 1 CDRA. ANTES DE AMECFA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -4.591314005199,
    "lng": -81.252495670549
   },
   {
    "zona": "PARINAS",
    "direccion": "PARQUE 22 – 03 LATERAL. TALARA BAJA, PARIÑAS - TALARA - PIURA. REF. FRENTE A MINSA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -4.575510000001,
    "lng": -81.268615329431
   }
  ],
  "Sechura": [
   {
    "zona": "SECHURA",
    "direccion": "AV. BAYOVAR N° 311  REFERENCIA : AL COSTADO DE ANTENA 10 RADIO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.5556999,
    "lng": -80.81829
   }
  ],
  "Piura": [
   {
    "zona": "26 DE OCTUBRE",
    "direccion": "URB. PARQUE INDUSTRIAL PIURA FUTURA MZ. G, LT. 1A. 26 DE OCTUBRE - PIURA, REFERENCIA: AL FRENTE DEL GRIFO PETRO PERÚ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -5.1605551169742,
    "lng": -80.690649236109
   },
   {
    "zona": "26 DE OCTUBRE",
    "direccion": "A.A.H.H. CONSUELO DE VELASCO 1 ETAPA SECTOR B MZ LT.18  26 DE OCTUBRE – PIURA, REF. CRUCE AV. CIRCUNVALACIÓN CON AV. GULLMAN AL COSTADO DE LA FERRETERIA LOS REYES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.1979627644128,
    "lng": -80.642655599997
   },
   {
    "zona": "26 DE OCTUBRE",
    "direccion": "URB. SANTA ROSA MZ. D LT. 7, SECT. 7, 26 DE OCTUBRE - PIURA. REF. AV. RAUL MATA LA CRUZ CON CIRCUNVALACIÓN AL FRENTE DE REPUESTOS FRANK|",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.1891416643432,
    "lng": -80.665360286188
   },
   {
    "zona": "26 DE OCTUBRE",
    "direccion": "CALLE TRES N° 102, SUBLOTE N° 1D MZ. Y - ZONA INDUSTRIAL II, DISTRITO 26 DE OCTUBRE - REFERENCIA: AL COSTADO DE SENATI",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -5.1799717074005,
    "lng": -80.652250843267
   },
   {
    "zona": "CASTILLA",
    "direccion": "AV. TACNA 503 CASTILLA - PIURA, REFERENCIA: FRENTE A UGEL DE CASTILLA",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.2024612,
    "lng": -80.6241167
   },
   {
    "zona": "CASTILLA",
    "direccion": "CARR. PANAMERICANA A-2 AH. ALMIRANTE MIGUEL GRAU I ETAPA, CASTILLA - PIURA - PIURA, REF. AL COSTADO DE CERÁMICAS SAN LORENZO",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.1904180356006,
    "lng": -80.603083300001
   },
   {
    "zona": "CATACAOS",
    "direccion": "AV. FRANCISCO BOLOGNESI MZ. 60 LT. 37 CATACAOS - PIURA - PIURA, REF. AL LADO DEL EX PRONEI",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.267972200001,
    "lng": -80.672388229458
   },
   {
    "zona": "LA UNION",
    "direccion": "AV. LIMA N° 590  REFERENCIA : frente a tiendas chancafe",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.3993284,
    "lng": -80.742189
   },
   {
    "zona": "LAS LOMAS",
    "direccion": "JR. MIGUEL GRAU MZ. H LT. 7, LAS LOMAS - PIURA, REF. AL COSTADO DE CAJA HUANCAYO Y AL COSTADO DE COMISARIA LAS LOMAS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -4.6565833861674,
    "lng": -80.243888252653
   },
   {
    "zona": "PIURA",
    "direccion": "AV. MÁLAGA MZ. A LT.20 INT. 105 PIURA, REF. A MEDIA CUADRA DE HONDA DEL PERU S.A. EN EL CRUCE DE AV. LUIS EGUIGUREN CON SULLANA NORTE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -5.1854726017121475,
    "lng": -80.63332306469526
   },
   {
    "zona": "PIURA",
    "direccion": "AV. RAÚL MATA LA CRUZ LT. 11 MZ. C URB. LOS JARDINES - CORPIURA, - PIURA - PIURA - PIURA, REF. A UNA CDRA. DE LOS 2 GRIFOS EN TODA LA AV. RAÚL MATA LA CRUZ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.166389,
    "lng": -80.653667
   },
   {
    "zona": "PIURA",
    "direccion": "Aeropuerto Internacional Guillermo Concha Ibérico",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": null,
    "lng": null
   },
   {
    "zona": "PIURA",
    "direccion": "Av. grau manzana N, lote 33 - urbanización la alborada. ref. Grau con marcavelica",
    "telefono": "015007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.1867475,
    "lng": -80.6547354
   },
   {
    "zona": "TAMBO GRANDE",
    "direccion": "AA. HH. EL HUERTO MZ. E LT. 08 TAMBO GRANDE – PIURA - PIURA, REF. ATRÁS DEL COLEGIO INA 54 AGROPECUARIO, A LA ALTURA DEL CAMPO CAMPESTRE RIVERA DEL RÍO",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -4.9350843412188,
    "lng": -80.34533475739
   }
  ],
  "Sullana": [
   {
    "zona": "BELLAVISTA",
    "direccion": "CALLE MOQUEGUA 381, BELLAVISTA, REF. REST. PARRILLADAS CHAVELOS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -4.8911773362203,
    "lng": -80.678927709773
   },
   {
    "zona": "IGNACIO ESCUDERO",
    "direccion": "AV. PANAMERICANA CALLE 26 LOTE 3, IGNACIO ESCUDERO - SULLANA - PIURA, REF. FRENTE A LA INSTITUCIÓN EDUCATIVA IGNACIO ESCUDERO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -4.8464431521603,
    "lng": -80.873376309797
   },
   {
    "zona": "SULLANA",
    "direccion": "CTRA. SULLANA Nº S/N MZ. K, LT. 06 - ZONA INDUSTRIAL MUNICIPAL, REFERENCIA: AL COSTADO DEL HOTEL COCO SUITE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -4.924883,
    "lng": -80.696031
   },
   {
    "zona": "SULLANA",
    "direccion": "Carretera Panamericana Norte Nº 790 SULLANA   REFERENCIA : FRENTE AL COLEGIO CHIQUITITOS",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -4.908899,
    "lng": -80.697109
   }
  ],
  "Huancabamba": [
   {
    "zona": "HUANCABAMBA",
    "direccion": "AV. RAMON CASTILLA 0351 HUANCABAMBA - PIURA, REF. A 1 CUADRA DE LA CAPILLA RAMON CASTILLA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -5.24390333549,
    "lng": -79.453353341105
   }
  ],
  "Ayabaca": [
   {
    "zona": "AYABACA",
    "direccion": "CALLE BOLOGNESI N° 136, REF. A 2 CUADRAS DE LA PLAZA DE ARMAS DE AYABACA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -4.6400387456146,
    "lng": -79.714678136096
   },
   {
    "zona": "PAIMAS",
    "direccion": "AV. SULLANA S/N, REF. FRENTE AL COMPLEJO EDUCATIVO JUAN VELASCO ALVARADO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -4.62382798467,
    "lng": -79.948503000001
   }
  ],
  "Morropón": [
   {
    "zona": "CHULUCANAS",
    "direccion": "JR. HUANCAVELICA N° 548   REFERENCIA : AL LADO DEL TERMINAL DE RONCO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.0955589,
    "lng": -80.1629195
   },
   {
    "zona": "MORROPON",
    "direccion": "JR. ADRIANZÉN N° 099, MORROPON - MORROPON - PIURA, REF, A ESPALDAS DE DEL TERMINAL TERRESTRE DE TRAMPSA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -5.1891950678039,
    "lng": -79.972304929448
   }
  ],
  "Paita": [
   {
    "zona": "PAITA",
    "direccion": "MZ. H LT. 14 URB. SOL Y MAR  - PAITA, REFERENCIA: AL COSTADO DE LA EMPRESA SAN MIGUEL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -5.0867947730703,
    "lng": -81.093009488701
   }
  ]
 },
 "La Libertad": {
  "Trujillo": [
   {
    "zona": "EL PORVENIR",
    "direccion": "AV. HERMANOS ANGULO 628, TRUJILLO, REF. A ESPALDAS DE LA MUNICIPALIDAD EL PORVENIR",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.0843892837298,
    "lng": -79.000249497004
   },
   {
    "zona": "EL PORVENIR",
    "direccion": "AV. PROLONGACIÓN 12 DE NOVIEMBRE, MZ. Q, LT. 25, REFERENCIA: A MEDIA CDRA. DE LA COMISARÍA ALTO TRUJILLO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.0688863115724,
    "lng": -79.021611486879
   },
   {
    "zona": "EL PORVENIR",
    "direccion": "AV. LAS MAGNOLIAS MZ. 25 LT. 2A NUEVO PORVENIR, EL PORVENIR - TRUJILLO - LA LIBERTAD, REF. A UNA CDRA. DEL PODER JUDICIAL CISAJ SEDE EL PORVENIR",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.0701613262859,
    "lng": -79.011612049897
   },
   {
    "zona": "EL PORVENIR",
    "direccion": "JR. CAHUIDE N° 342 AA.HH LA MERCED - EL PORVENIR - TRUJILLO - LA LIBERTAD, REF. A UNA CDRA. DEL ARCO DEL PORVENIR / A UNA CDRA. DE LA PARROQUIA EL BUEN PASTOR",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.0861170633811,
    "lng": -79.004310200334
   },
   {
    "zona": "EL PORVENIR",
    "direccion": "AV. 12 DE NOVIEMBRE M. W LOTE 19 MZ. 3A, EL PORVENIR - TRUJILLO - LA LIBERTAD, REF. AL FRENTE DEL COMPLETO DEPORTIVO JOSÉ CAIPO",
    "telefono": "01 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.0652017214992,
    "lng": -79.022208280762
   },
   {
    "zona": "HUANCHACO",
    "direccion": "CARRETERA VIA DE EVITAMIENTO 576.2 HUANCHAQUITO ALTO - TRUJILLO - LA LIBERTAD, REF. A 1 CDRA. DE OVALO HUANCHACO / AL COSTADO DE CONDOMINIO LAS BRISAS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.0940006638734,
    "lng": -79.097945741105
   },
   {
    "zona": "HUANCHACO",
    "direccion": "AV. INDUSTRIAL MZ 23 LT. 13 SECTOR II – EL MILAGRO, HUANCHACO - TRUJILLO - LA LIBERTAD, REF. A 2 CDRAS. DE LA PLAZA DE ARMAS DE EL MILAGRO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.0226277284451,
    "lng": -79.068544041134
   },
   {
    "zona": "LA ESPERANZA",
    "direccion": "AV. TAHUANTINSUYO N° 739, LA ESPERANZA – TRUJILLO – LA LIBERTAD, REF. DIAGONAL A GRIFO EL AMIGO. / ENTRE PASAJE SANTA ANA Y AV. LOS LAURELES",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.0860539275375,
    "lng": -79.041433559277
   },
   {
    "zona": "LA ESPERANZA",
    "direccion": "MZ. 1 LT. 23 AA.HH WICHANZAO – LA ESPERANZA – TRUJILLO – LA LIBERTAD, REF. AL COSTADO DEL ALMACÉN SUNAT. / DIAGONAL AL HOSPITAL DE ALTA COMPLEJIDAD VIRGEN DE LA PUERTA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.0521209280154,
    "lng": -79.05562705114
   },
   {
    "zona": "MOCHE",
    "direccion": "AV. LA MARINA LOTE 25 - B – MOCHE – TRUJILLO - LA LIBERTAD, REF. A MEDIA CDRA DE LA COMISARÍA DE MOCHE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.1718883345549,
    "lng": -79.011334590606
   },
   {
    "zona": "TRUJILLO",
    "direccion": "Calle LiverpoOl N° 329 / Urb. Santa Isabel - Trujillo.  referencia : a una cuadra antes de la Iglesia de Mansiche",
    "telefono": "(01) 500 - 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.103728,
    "lng": -79.042822
   },
   {
    "zona": "TRUJILLO",
    "direccion": "CALLE ATAHUALPA 481 – TRUJILLO – LA LIBERTAD, REF. A 1/2 CDRA DE LA AV LOS INCAS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.1150950743473,
    "lng": -79.023006204424
   },
   {
    "zona": "TRUJILLO",
    "direccion": "Aeropuerto Internacional Capitán FAP Carlos Martinez de Pinillos",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": null,
    "lng": null
   },
   {
    "zona": "TRUJILLO",
    "direccion": "CALLE SANTA CRUZ N° 389 CHICAGO - TRUJILLO - LA LIBERTAD, REF. A MEDIA CDRA. DE LA AV. AMERICA SUR/A MEDIA CUADRA DEL ESTADIO CHAN CHAN.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.1169719966571,
    "lng": -79.017168118756
   },
   {
    "zona": "TRUJILLO",
    "direccion": "URB. VISTA HERMOSA MZ. F LT. 11 PISO °1 TRUJILLO - TRUJILLO - LA LIBERTAD, REF. A ESPALDAS DEL METRO DEL OVALO PAPAL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.1196746638327,
    "lng": -79.042061399999
   },
   {
    "zona": "TRUJILLO",
    "direccion": "AV. HERMANOS UCEDA MEZA N° 269 URB MIRAFLORES II ETAPA - TRUJILLO - TRUJILLO - LA LIBERTAD, REF. A UNA CDRA. DE AV. AMERICA NORTE. / ENTRE AV. MIRAFLORES Y AV. SALVADOR LARA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.0988234915918,
    "lng": -79.02339297055
   },
   {
    "zona": "TRUJILLO",
    "direccion": "AV. LA PERLA MZ. E LOTE 05 URB. INGENIERIA – TRUJILLO – LA LIBERTAD, REF. A 1 cDRA. DEL COLEGIO BRUNING",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.1279459649259,
    "lng": -79.027663092444
   },
   {
    "zona": "VICTOR LARCO HERRERA",
    "direccion": "AV. LARCO 865, TRUJILLO - TRUJILLO - LA LIBERTAD, REF.  MZ X LT 28 CUI SAN ANDRES V ETAPA TERCER SECTOR Y FRENTE AL COLEGIO JESUS MARIA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.137749685409007,
    "lng": -79.05033495086825
   }
  ],
  "Sánchez Carrión": [
   {
    "zona": "HUAMACHUCO",
    "direccion": "JR. SIMON BOLIVAR 763, HUAMACHUCO SANCHEZ CARRION - LA LIBERTAD, REF. ENTRE JR. INDEPENDECIA Y JR. ALFONSO UGARTE",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.8123777275905,
    "lng": -78.049513218584
   }
  ],
  "Pacasmayo": [
   {
    "zona": "GUADALUPE",
    "direccion": "MZ. A LT. 01 CPM CIUDAD DE DIOS - SEC. LOS ÁNGELES – GUADALUPE – LA LIBERTAD, REF. AL COSTADO DEL MOLINO SAMÁN Y A DOS CUADRAS DEL CRUCE A CAJAMARCA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.3078077719091,
    "lng": -79.480498695801
   },
   {
    "zona": "GUADALUPE",
    "direccion": "AV. NILLA CERRUTY N° 299 - GUADALUPE – PACASMAYO – LA LIBERTAD, ref. AL COSTADO DEL GRIFO REPSOL - NEOTECH",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.2469439071577,
    "lng": -79.46819496902
   },
   {
    "zona": "PACASMAYO",
    "direccion": "AV. GONZALO UGAZ SALCEDO S/N - PACASMAYO - LA LIBERTAD, REF. AL COSTADO DEL ESTADIO MUNICIPAL DE PACASMAYO / A MEDIA CDRA. DEL SUPERMERCADO TOTTUS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.3998619490134,
    "lng": -79.566583624171
   },
   {
    "zona": "PACASMAYO",
    "direccion": "CTRA. PANAMERICANA NORTE N° MZ. P LT. 4A - A.H. LAS PALMERAS, REFERENCIA: ENTRE AV. SUCRE Y AV. LEONCIO PRADO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -7.3942461776644,
    "lng": -79.564250835777
   },
   {
    "zona": "SAN PEDRO DE LLOC",
    "direccion": "AV. VÍA DE EVITAMIENTO N° 407, SAN PEDRO DE LLOC - PACASMAYO - LA LIBERTAD, REF. A MEDIA CDRA. DE LA CALLE LIBERTAD/ A MEDIA CDRA. DEL PARADERO DE LA VIA DE EVITAMIENTO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -7.432359975376,
    "lng": -79.500667425779
   }
  ],
  "Virú": [
   {
    "zona": "CHAO",
    "direccion": "AV. VICTOR RAUL HAYA DE LA TORRE 575 CHAO - VIRU, REF. A MEDIA CDRA. DE LA COMISARÍA DE CHAO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.5379739271001,
    "lng": -78.678412960146
   },
   {
    "zona": "VIRU",
    "direccion": "CALLE PUNO N° 125 - MZ. 32 LT. 7A - VIRÚ - LA LIBERTAD, REF. A MEDIA CDRA. DEL CRUCE DE LA AV. VIRU CON LA CALLE JORGE CHAVEZ / A MEDIA CDRA. DE LA PLAZUELA MARIA PARADO DE BELLIDO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.4153338853584,
    "lng": -78.75430648376
   },
   {
    "zona": "VIRU",
    "direccion": "PANAMERICANA NORTE N° 933 PUENTE VIRÚ - VIRÚ - LA LIBERTAD, REF. a MEDIA CDRA. DEL GRIFO ZONA ETNA/MEDIA CDRA. DEL SEMAFORO ZONA ETNA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.4283352899314,
    "lng": -78.778388900003
   }
  ],
  "Ascope": [
   {
    "zona": "CASA GRANDE",
    "direccion": "CALLE LUIS SÁNCHEZ N° 152 SECTOR PARTE ALTA. CASA GRANDE - ASCOPE - LA LIBERTAD, REF. CRUCE CON AV. ESTADIO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.7392758167105,
    "lng": -79.187860328116
   },
   {
    "zona": "PAIJAN",
    "direccion": "AV. PANAMERICANA NRO. 2321 LA LIBERTAD - ASCOPE - PAIJAN, REF. A 1 CDRA. DEL ESTADIO MUNICIPAL DE PAIJÁN",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.7222500000004,
    "lng": -79.308472200001
   }
  ],
  "Chepén": [
   {
    "zona": "CHEPEN",
    "direccion": "PROLONGACION EZEQUIEL GONZALES CACEDA 193 - SEC. CHEPEN, FRENTE AL COLISEO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.2211028,
    "lng": -79.436371
   },
   {
    "zona": "PACANGA",
    "direccion": "CARRETERA PANAMERICANA  # 835 - URB. PACANGUILLA - DISTRITO PACANGA, REFERENCIA: EN LA MISMA PANAMERICANA",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.154513,
    "lng": -79.446302
   }
  ],
  "Otuzco": [
   {
    "zona": "OTUZCO",
    "direccion": "AV. ALFREDO GUTIÉRREZ N° 120 - Otuzco - Otuzco - La Libertad.",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -7.9063204,
    "lng": -78.5644849
   }
  ]
 },
 "Tumbes": {
  "Tumbes": [
   {
    "zona": "CORRALES",
    "direccion": "AV. HUÁSCAR Nº 311 INT. 01 CENTRO, CORRALES - TUMBES, REF. A ESPALDAS DE LA PLAZA DE ARMAS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -3.602026086071,
    "lng": -80.480083521582
   },
   {
    "zona": "LA CRUZ",
    "direccion": "JR. PIURA 105 CALETA LA CRUZ, LA CRUZ - TUMBES, REF. FRENTE A CTR. PANAMERICANA NORTE Y AL FRENTE DE MOTOREPUESTOS Y MULTISERVICIOS LUJAN",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -3.6376008662908,
    "lng": -80.586921583879
   },
   {
    "zona": "TUMBES",
    "direccion": "Av. Arica N° 227 - Tumbes.",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -3.5654275,
    "lng": -80.4590402
   },
   {
    "zona": "TUMBES",
    "direccion": "URB. ANDRÉS ARAUJO MORÁN MZ. 28-A LOTE 03 CALLE JACINTO SEMINARIO, REF. AL COSTADO DEL MERCADO PUYANGO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -3.5630010344404,
    "lng": -80.426500210134
   },
   {
    "zona": "TUMBES",
    "direccion": "AV. PANAMERICANA NORTE S/N VILLA PRIMAVERA - TUMBES. REF. PASANDO SENATI FRENTE A AGRIPAC",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -3.5524449279815,
    "lng": -80.419805284875
   },
   {
    "zona": "TUMBES",
    "direccion": "Aeropuerto Internacional Pedro Canga Rodríguez",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": null,
    "lng": null
   },
   {
    "zona": "TUMBES",
    "direccion": "MZ. 0U LT. 00A AA.HH. PAMPA GRANDE, TUMBES, REF. FRENTE A LA AV. UNIVERSITARIA, Y AL FRENTE A LA IGLESIA MORMONES Y AL LADO DE UN LAVADERO DE AUTOS.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -3.5777440688748,
    "lng": -80.451575070302
   }
  ],
  "Zarumilla": [
   {
    "zona": "AGUAS VERDES",
    "direccion": "AV TUMBES S/N LOTE 09 MZ 17 , A.H TOMAS ARIZOLA OLAYA , SECTOR II - REFERENCIA : A UNA CUADRA DEL PARQUE TOMAS ARIZOLA.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -3.4805719,
    "lng": -80.2469869
   },
   {
    "zona": "ZARUMILLA",
    "direccion": "JIRON INDEPENDENCIA 309 ZARUMILLA, REF. ATRÁS DE LA PLAZA DE ARMAS Y FRENTE AL DORADO PASANDO 5 CASAS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -3.5026340959138,
    "lng": -80.274779168572
   }
  ],
  "Contralmirante Villar": [
   {
    "zona": "ZORRITOS",
    "direccion": "AV. 28 DE JULIO N° 205 MZ. 14 LT. 04 LOS PINOS TUMBES, CONTRALMIRAANTE VILLAR - ZORRITOS - TUMBES",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -3.6826429893427,
    "lng": -80.686485170117
   }
  ]
 },
 "Amazonas": {
  "Utcubamba": [
   {
    "zona": "BAGUA GRANDE",
    "direccion": "AV. CHACHAPOYAS 1094 SECTOR GONCHILLO, REF. A 2 CUADRAS DE LA CLÍNICA SEÑOR DE LOS MILAGROS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.7502771328253,
    "lng": -78.449191047248
   }
  ],
  "Bongará": [
   {
    "zona": "JAZAN",
    "direccion": "AV. SACSAHUAMAN N° 513 - PEDRO RUIZ, REF. A MEDIA CUADRA DE LA UGEL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.9481590587064,
    "lng": -77.979191086497
   }
  ],
  "Chachapoyas": [
   {
    "zona": "CHACHAPOYAS",
    "direccion": "JR. GRAU 270, REF. JUNTO A LA AGENCIA DE VIAJES MONTEVERDE",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.2269907390686,
    "lng": -77.871959791137
   },
   {
    "zona": "CHACHAPOYAS",
    "direccion": "JR. DOS DE MAYO CDRA. 15 S/N CHACHAPOYAS, REFERENCIA: JUNTO A TERMINAL DE COMBIS ETSA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.2386732901495,
    "lng": -77.868008265336
   }
  ],
  "Luya": [
   {
    "zona": "LUYA",
    "direccion": "JR. RAMÓN CASTILLA S/N, LUYA - AMAZONAS, REF. ENTRE EL COLEGIO SECUNDARIO RAMÓN CASTILLA Y EL JR. JOSÉ GÁLVEZ, A MEDIA CDRA. DEL AGENTE DE VENTA DE PASAJES DE CIVA, MÓVIL Y TRANSPORTE CHICLAYO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -6.159612028355,
    "lng": -77.944719801561
   }
  ],
  "Bagua": [
   {
    "zona": "BAGUA",
    "direccion": "JR. AMAZONAS C-9 MZ. 126 LT. 25, BAGUA - BAGUA - AMAZONAS, REF. FRENTE AL PARQUE JERUSALEN Y/O COSTADO DE AVICOLA YACEG",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.6347003028441,
    "lng": -78.528378922503
   }
  ]
 },
 "Loreto": {
  "Maynas": [
   {
    "zona": "IQUITOS",
    "direccion": "JR PABLO ROSSEL 590 CON NANAY, REF. FRENTE AL CETPRO AMERICAN COMPUTER",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -3.7418759911191,
    "lng": -73.243443036497
   },
   {
    "zona": "IQUITOS",
    "direccion": ".......",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": 0,
    "lng": 0
   },
   {
    "zona": "IQUITOS",
    "direccion": "JR. FRANCISCO BOLOGNESI #941 CON JR. BERMÚDEZ, IQUITOS - MAYNAS - LORETO, REF. FRENTE A LA UNIVERSIDAD NACIONAL DE LA AMAZONIA PERUANA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -3.7541661727549,
    "lng": -73.252084268484
   },
   {
    "zona": "IQUITOS",
    "direccion": "Aeropuerto Coronel Francisco secada Vignetta",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": null,
    "lng": null
   },
   {
    "zona": "IQUITOS",
    "direccion": "AV.  TUPAC AMARU CON - CALLE LOURDES DE LEÓN #479 IQUITOS MAYNAS - LORETO, REF. FRENTE A LA BOTICA THIAGOFAMA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -3.7550842625749,
    "lng": -73.269944604887
   },
   {
    "zona": "IQUITOS SAN JUAN BAUTISTA",
    "direccion": "AV. PARTICIPACIÓN PARCELA 9-A SAN JUAN BAUTISTA - MAYNAS - LORETO, REF. FRENTE AL LAVADERO OSITO Y A MEDIA CDRA. DEL PARQUE 1 DE ENERO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -3.7793125277868,
    "lng": -73.27991317086
   },
   {
    "zona": "IQUITOS SAN JUAN BAUTISTA",
    "direccion": "AV. JOSÉ ABELARDO QUIÑONES # 2475 SAN JUAN BAUTISTA - MAYNAS - LORETO, REF. FRENTE A LA UNIVERSIDAD CIENTÍFICA DEL PERÚ (UCP)",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -3.7704160308984,
    "lng": -73.281970858895
   },
   {
    "zona": "IQUITOS SAN JUAN BAUTISTA",
    "direccion": "CARRETERA IQUITOS NAUTA, S/N MZ. K - LT. 20, SAN JUAN BAUTISTA - MAYNAS - LORETO, REF. AL COSTADO DE LA DISTRIBUIDORA AMAZON GAS.",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -3.7960541680007,
    "lng": -73.301555482859
   },
   {
    "zona": "PUNCHANA",
    "direccion": "CALLE BORJA N°648 PUNCHANA - MAYNAS - LORETO, REF. AL COSTADO DE LA FARMACIA SAN CARLOS CENTRO MÉDICO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -3.7299283680047,
    "lng": -73.247475881523
   }
  ],
  "Alto Amazonas": [
   {
    "zona": "YURIMAGUAS",
    "direccion": "CALLE JORGE CHÁVEZ N° 300, REFERENCIA: ESQUINA CON PROGRESO, AL COSTADO DE ENAPU",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -5.8863186,
    "lng": -76.1105129
   },
   {
    "zona": "YURIMAGUAS",
    "direccion": "Shalom",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": 0,
    "lng": 0
   }
  ]
 },
 "Ucayali": {
  "Coronel Portillo": [
   {
    "zona": "PUCALLPA CALLERIA",
    "direccion": "Jr. Jose Galvez 147 calleria - CORONEL PORTILLO - Ucayali.  RefERENCIA :  a media cuadra de la Av. Centenario",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.382759,
    "lng": -74.545825
   },
   {
    "zona": "PUCALLPA CALLERIA",
    "direccion": "AV. SAENZ PEÑA 229, CALLERIA - CORONEL PORTILLO - UCAYALI, REF. A DOS CUADRAS DEL OVALO DE FEDERICO BASADRE Y SAENZ PEÑA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.3798995267862,
    "lng": -74.538027470552
   },
   {
    "zona": "PUCALLPA CALLERIA",
    "direccion": "Aeropuerto David Abensur Rengifo",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": null,
    "lng": null
   },
   {
    "zona": "PUCALLPA MANANTAY",
    "direccion": "AV. AGUAYTIA MZ., 26 LT. 20 MANANTAY - CORONEL PORTILLO - UCAYALI, REF. A MEDIA CDRA. DEL NUEVO MERCADO DE SAN FERNANDO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.3978536633598,
    "lng": -74.540658011659
   },
   {
    "zona": "PUCALLPA MANANTAY",
    "direccion": "AV. TUPAC AMARU 2315 MANANTAY - CORONEL PORTILLO - UCAYALI, REF. A MEDIA CDRA. DE LA POLLERIA EMANUEL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.3984739366528,
    "lng": -74.555353799976
   },
   {
    "zona": "PUCALLPA YARINACOCHA",
    "direccion": "CARRETERA FEDERICO BASADRE KM 6.800 YARINACOCHA - CORONEL PORTILLO - UCAYALI, REF. Entrada del Asentamiento Humano Alan Sisley/Al costado de la empresa JVJ Service Oriente SAC",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.3937480000004,
    "lng": -74.588120999999
   },
   {
    "zona": "PUCALLPA YARINACOCHA",
    "direccion": "JR. TUPAC AMARU, MZ. 50, LT. 07, REFERENCIA: A ESPALDA DE MAESTRANZA DE YARINACOCHA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.3577486634305,
    "lng": -74.576310341108
   },
   {
    "zona": "PUCALLPA YARINACOCHA",
    "direccion": "AV. UNIVERSITARIA MZA A LOTE 6, YARINACOCHA - CORONEL PORTILLO - UCAYALI, REF. A MEDIA CDRA. DEL LOCAL ROKALPA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -8.3800171366071,
    "lng": -74.568467158895
   }
  ],
  "Padre Abad": [
   {
    "zona": "AGUAYTIA",
    "direccion": "U. VECINAL BARRIO UNIDO MZ. 1 LT. 2, PADRE ABAD - UCAYALI, REF. AL COSTADO DEL TERMINAL TERRESTRE DE AGUAYTIA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -9.0356284532572,
    "lng": -75.496011504332
   }
  ]
 },
 "Callao": {
  "Prov. Const. del Callao": [
   {
    "zona": "BELLAVISTA",
    "direccion": "AV. ELMER FAUCETT 1641 - URB. JARDINES VIRÚ MZ. B LT 46, BELLAVISTA - CALLAO, REF. A 2 CUADRAS DEL CRUCE DE AV. FAUCETT CON AV. VENEZUELA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.060813729761168,
    "lng": -77.0975644930893
   },
   {
    "zona": "CALLAO",
    "direccion": "AV. ELMER FAUCETT N° 492",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.049958017539462,
    "lng": -77.09809500001097
   },
   {
    "zona": "CALLAO",
    "direccion": "UNIDAD INMOBILIARIA N° 1, AV. QUILCA MZ. G SUB LT. 11C, URB. AEROPUERTO – SEGUNDO SECTOR - CALLAO, REF. CRUCE CON CALLE 1, FRENTE A LA IGLESIA DE TESTIGOS DE JEHOVÁ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.033462418573276,
    "lng": -77.0964266665613
   },
   {
    "zona": "CALLAO",
    "direccion": "AV. ALEJANDRO BERTELLO BOLLATI MZ. B LT. 20 Y 21 – URB. PROGRESIVA BAHÍA BLANCA – CALLAO - CALLAO - CALLAO, REF. FRENTE AL MERCADO COSTA AZUL",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.985684611868939,
    "lng": -77.11583789999891
   },
   {
    "zona": "CALLAO",
    "direccion": "AV. SAENZ PEÑA N° 414 - 416 - CALLAO - CALLAO, REF. CRUCE CON AV. MARCO POLO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 7:00 PM",
    "lat": -12.061012700004229,
    "lng": -77.14257909998511
   },
   {
    "zona": "CALLAO",
    "direccion": "AEROPUERTO INTERNACIONAL JORGE CHAVEZ",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": null,
    "lng": null
   },
   {
    "zona": "CALLAO",
    "direccion": "AV. ELMER FAUCETT 3443 - CALLAO, REF. AL COSTADO DEL AEROPUERTO JORGE CHÁVEZ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 10:00 AM A 8:00 PM",
    "lat": -12.018873043479367,
    "lng": -77.10865123042156
   },
   {
    "zona": "LA PERLA",
    "direccion": "AV. LA MARINA 530, URB. BENJAMIN DOIGG LOSSIO, LA PERLA, CALLAO, REF. A 3 CUADRAS DEL ÓVALO DE LA PERLA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.068000755733,
    "lng": -77.115764452752
   },
   {
    "zona": "MI PERU",
    "direccion": "V. VICTOR RAUL HAYA DE LA TORRE MZ. A LT. 02 ASENTAMIENTO HUMANO CONFRATERNIDAD - III SECTOR - MI PERU – CALLAO - CALLAO, REF. CRUCE CON AV. AREQUIPA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.857445566174341,
    "lng": -77.12850028736655
   },
   {
    "zona": "VENTANILLA",
    "direccion": "CALLE 19, Mz. J Lt. 26 ZN - URB. Coop. De La Marina, REFERENCIA: AL COSTADO DE LUBRICENTRO PABLITO ROMERO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -11.87987048810658,
    "lng": -77.12691298460291
   },
   {
    "zona": "VENTANILLA",
    "direccion": "AV. 225 MZ. H SUB LT. T. 11 - ASOC  PROY. ESP. CIUDAD PACHACUTEC, REF. A 1 CDRA. DEL CRUCE CON AV. LOS PROYECTISTAS, VENTANILLA - LIMA - LIMA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.841691881151,
    "lng": -77.137115856604
   },
   {
    "zona": "VENTANILLA",
    "direccion": "AV. 225 MZ F LOTE 2 SECTOR A GRUPO RESIDENCIAL A2 - PROYECTO PILOTO NUEVO PACHACUTEC, VENTANILLA - CALLAO - CALLAO, REF. FRENTE AL CENTRO DE SALUD 3 DE FEBRERO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.829064116198,
    "lng": -77.158289677599
   },
   {
    "zona": "VENTANILLA",
    "direccion": "AV. 150 IZQUIERDA MZ. W2 LT. 01 PROYECTO PILOTO NUEVO PACHACUTEC, VENTANILLA - CALLAO - CALLAO, REF. A 1 CDRA. DEL CRUCE AV. CAMINO DEL INCA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -11.838273352411672,
    "lng": -77.15642144840947
   }
  ]
 },
 "Huancavelica": {
  "Huancavelica": [
   {
    "zona": "HUANCAVELICA",
    "direccion": "AV. UNIVERSITARIA 1003 - HUANCAVELICA, REF. A 1 CDRA. DE LA ESCUELA SANTA ANA Y A 3 CDRAS. DEL PUENTE DEL EJÉRCITO (BARRIO SANTA ANA)",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.783667969689,
    "lng": -74.964528087041
   }
  ]
 },
 "Madre de Dios": {
  "Tambopata": [
   {
    "zona": "INAMBARI",
    "direccion": "AV. LOS PIONEROS, LT. 2 Y 3, INAMBARI – TAMBOPATA - MADRE DE DIOS, REF. AL COSTADO DEL TERMINAL TERRESTRE DE MAZUKO / AL PIE DE LA CARRETERA AL RIO INAMBARI",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -13.098946521772,
    "lng": -70.369917328069
   },
   {
    "zona": "LAS PIEDRAS",
    "direccion": "AV. INTEROCEANICA KM. 1 , LAS PIEDRAS - TAMBOPATA - MADRE DE DIOS, REF. AL COSTADO DEL GRIFO VIRGEN NATIVIDAD",
    "telefono": "01 5007878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.580879,
    "lng": -69.172572
   },
   {
    "zona": "TAMBOPATA",
    "direccion": "Aeropuerto Internacional Padre Aldamiz",
    "telefono": null,
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": 0,
    "lng": 0
   },
   {
    "zona": "TAMBOPATA",
    "direccion": "AV. LA JOYA N° 122 - PTO. MALDONADO, REFERENCIA: FRENTE AL ÓVALO DE LOS OTORONGOS",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8AM A 8PM",
    "lat": -12.599565,
    "lng": -69.1949842
   },
   {
    "zona": "TAMBOPATA",
    "direccion": "AV. CIRCUNVALACION MZ. C LT. 01, TAMBOPATA - TAMBOPATA - MADRE DE DIOS, REF. A DOS CDRAS. DE LA CARRETERA INTEROCEANICA SUR / CRUCE CON JR. LAS MERCEDES CABELLO",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.581888331368,
    "lng": -69.202891221518
   },
   {
    "zona": "TAMBOPATA",
    "direccion": "AV. 15 DE AGOSTO N° 529, TAMBOPATA - TAMBOPATA - MADRE DE DIOS, REF. A ESPALDAS DEL COLEGIO CARLOS FERMIN FITZCARRALD / CRUCE CON JR. ICA",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 8:00 PM",
    "lat": -12.590861310162,
    "lng": -69.189889605433
   }
  ],
  "Tahuamanu": [
   {
    "zona": "IBERIA",
    "direccion": "AV. JORGE CHAVEZ MZ. H1 SUB LOTE 11-B, IBERIA - TAHUAMANU - MADRE DE DIOS, REF. A UNA CDRA. DE LA EMPRESA REAL DORADO / A UNA CDRA. Y MEDIA DE LA AV JOSE ALDAMIZ",
    "telefono": "(01) 500 7878",
    "horario": "LUNES A VIERNES - 8:00 AM A 6:00 PM",
    "lat": -11.406554280783,
    "lng": -69.487970049644
   }
  ]
 }
};
