export interface AnatomicalRegion {
  id: string;
  name: string;
  view: 'frente' | 'costas';
  category: 'cabeca' | 'tronco' | 'membros_superiores' | 'membros_inferiores';
  description: string;
  path: string;
  center: { x: number; y: number };
}

export const ANATOMICAL_REGIONS: AnatomicalRegion[] = [
  // ==========================================================================
  // --- VISÃO ANTERIOR (FRENTE) ---
  // Mapeamento construído do zero a partir da guideline clínica oficial frontal.
  // Posição anatômica anterior: paciente voltado para frente.
  // - Lado direito do paciente (D): lado esquerdo da tela (x < 341.5).
  // - Lado esquerdo do paciente (E): lado direito da tela (x > 341.5).
  // ==========================================================================
  {
    id: 'cabeca_frente_dir',
    name: 'Cabeça / Face (D)',
    view: 'frente',
    category: 'cabeca',
    description: 'Testa, face e mandíbula direita',
    center: { x: 323, y: 76 },
    path: 'M 335 16 L 320 21 L 307 34 L 302 48 L 301 73 L 304 82 L 303 89 L 305 101 L 313 124 L 327 138 L 334 141 L 340 141 L 340 110 L 334 109 L 335 106 L 340 106 L 340 16 Z'
  },
  {
    id: 'cabeca_frente_esq',
    name: 'Cabeça / Face (E)',
    view: 'frente',
    category: 'cabeca',
    description: 'Testa, face e mandíbula esquerda',
    center: { x: 361, y: 76 },
    path: 'M 344 16 L 344 106 L 349 107 L 348 110 L 344 110 L 344 141 L 349 141 L 363 133 L 374 116 L 382 86 L 380 84 L 382 74 L 382 53 L 378 37 L 368 24 L 357 18 Z'
  },
  {
    id: 'cervical_frente_dir',
    name: 'Pescoço / Cervical anterior (D)',
    view: 'frente',
    category: 'cabeca',
    description: 'Região anterior do pescoço e laringe direita',
    center: { x: 325, y: 155 },
    path: 'M 314 132 L 313 150 L 309 158 L 310 162 L 326 171 L 340 171 L 340 147 L 326 143 Z'
  },
  {
    id: 'cervical_frente_esq',
    name: 'Pescoço / Cervical anterior (E)',
    view: 'frente',
    category: 'cabeca',
    description: 'Região anterior do pescoço e laringe esquerda',
    center: { x: 358, y: 156 },
    path: 'M 370 132 L 358 143 L 344 147 L 344 171 L 353 172 L 371 164 L 375 160 L 370 148 Z'
  },
  {
    id: 'torax_sup_dir',
    name: 'Clavícula / Tórax superior (D)',
    view: 'frente',
    category: 'tronco',
    description: 'Clavícula e peito superior direito',
    center: { x: 307, y: 188 },
    path: 'M 272 180 L 272 184 L 279 197 L 281 210 L 313 207 L 315 205 L 340 205 L 340 175 L 327 174 L 324 171 L 314 167 L 308 161 Z'
  },
  {
    id: 'torax_sup_esq',
    name: 'Clavícula / Tórax superior (E)',
    view: 'frente',
    category: 'tronco',
    description: 'Clavícula e peito superior esquerdo',
    center: { x: 376, y: 188 },
    path: 'M 344 175 L 344 204 L 347 205 L 369 205 L 371 207 L 402 210 L 405 194 L 412 182 L 411 180 L 377 161 L 364 170 L 352 175 Z'
  },
  {
    id: 'ombro_frente_dir',
    name: 'Ombro direito anterior',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Deltóide anterior e articulação do ombro direito',
    center: { x: 248, y: 206 },
    path: 'M 272 186 L 268 182 L 244 191 L 232 198 L 224 207 L 219 216 L 214 235 L 247 219 L 279 210 L 277 197 Z'
  },
  {
    id: 'ombro_frente_esq',
    name: 'Ombro esquerdo anterior',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Deltóide anterior e articulação do ombro esquerdo',
    center: { x: 435, y: 206 },
    path: 'M 412 184 L 406 197 L 404 210 L 437 219 L 456 227 L 467 234 L 469 233 L 461 210 L 451 198 L 439 191 L 415 182 Z'
  },
  {
    id: 'peitoral_dir',
    name: 'Peitoral / Tórax anterior (D)',
    view: 'frente',
    category: 'tronco',
    description: 'Músculo peitoral e costelas anteriores direitas',
    center: { x: 301, y: 251 },
    path: 'M 340 209 L 314 208 L 278 212 L 278 215 L 266 233 L 261 247 L 262 252 L 260 270 L 263 279 L 262 282 L 269 291 L 284 299 L 286 297 L 340 279 Z'
  },
  {
    id: 'peitoral_esq',
    name: 'Peitoral / Tórax anterior (E)',
    view: 'frente',
    category: 'tronco',
    description: 'Músculo peitoral e costelas anteriores esquerdas',
    center: { x: 382, y: 251 },
    path: 'M 344 209 L 344 279 L 346 281 L 368 287 L 400 299 L 414 291 L 421 282 L 420 279 L 423 270 L 424 258 L 417 233 L 407 216 L 400 211 L 370 208 Z'
  },
  {
    id: 'braco_frente_dir',
    name: 'Braço direito anterior (Bíceps)',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Bíceps e face anterior do braço direito',
    center: { x: 233, y: 281 },
    path: 'M 277 213 L 258 217 L 232 227 L 215 236 L 213 239 L 211 270 L 206 291 L 202 332 L 206 336 L 221 341 L 235 341 L 245 337 L 254 308 L 256 295 L 256 272 L 254 264 L 255 248 L 258 249 L 258 251 L 264 233 Z'
  },
  {
    id: 'braco_frente_esq',
    name: 'Braço esquerdo anterior (Bíceps)',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Bíceps e face anterior do braço esquerdo',
    center: { x: 450, y: 281 },
    path: 'M 404 212 L 409 216 L 419 233 L 424 247 L 425 257 L 425 251 L 427 249 L 430 250 L 427 272 L 427 296 L 438 337 L 448 341 L 463 341 L 479 335 L 481 331 L 479 305 L 472 270 L 470 239 L 465 234 L 447 225 L 422 216 Z'
  },
  {
    id: 'abdomen_sup_dir',
    name: 'Abdômen superior direito',
    view: 'frente',
    category: 'tronco',
    description: 'Hipocôndrio direito, epigástrio e estômago superior',
    center: { x: 315, y: 323 },
    path: 'M 340 283 L 335 283 L 285 300 L 291 359 L 323 356 L 325 354 L 340 354 Z'
  },
  {
    id: 'abdomen_sup_esq',
    name: 'Abdômen superior esquerdo',
    view: 'frente',
    category: 'tronco',
    description: 'Hipocôndrio esquerdo, epigástrio e baço',
    center: { x: 369, y: 323 },
    path: 'M 345 282 L 344 354 L 393 360 L 395 328 L 399 302 L 398 299 Z'
  },
  {
    id: 'flanco_frente_dir',
    name: 'Flanco / Costelas (D)',
    view: 'frente',
    category: 'tronco',
    description: 'Lateral direita do tronco e arcos costais anteriores',
    center: { x: 278, y: 355 },
    path: 'M 261 283 L 261 304 L 274 363 L 273 386 L 268 418 L 287 426 L 290 360 L 282 299 L 279 299 L 269 293 Z'
  },
  {
    id: 'flanco_frente_esq',
    name: 'Flanco / Costelas (E)',
    view: 'frente',
    category: 'tronco',
    description: 'Lateral esquerda do tronco e arcos costais anteriores',
    center: { x: 406, y: 355 },
    path: 'M 422 283 L 414 293 L 401 300 L 394 361 L 397 425 L 412 420 L 416 415 L 411 393 L 409 362 L 422 304 Z'
  },
  {
    id: 'cotovelo_frente_dir',
    name: 'Cotovelo direito anterior',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Fossa cubital e dobra anterior do cotovelo direito',
    center: { x: 218, y: 354 },
    path: 'M 203 335 L 196 356 L 207 367 L 219 370 L 229 369 L 235 366 L 243 341 L 235 343 L 221 343 L 212 341 Z'
  },
  {
    id: 'cotovelo_frente_esq',
    name: 'Cotovelo esquerdo anterior',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Fossa cubital e dobra anterior do cotovelo esquerdo',
    center: { x: 464, y: 354 },
    path: 'M 481 335 L 471 341 L 463 343 L 448 343 L 440 341 L 447 365 L 450 368 L 458 370 L 470 369 L 479 365 L 485 358 L 485 350 L 482 344 Z'
  },
  {
    id: 'abdomen_inf_dir',
    name: 'Abdômen inferior / Fossa ilíaca (D)',
    view: 'frente',
    category: 'tronco',
    description: 'Baixo ventre, mesogástrio e fossa ilíaca direita',
    center: { x: 315, y: 393 },
    path: 'M 340 358 L 324 357 L 291 361 L 289 426 L 307 428 L 340 428 Z'
  },
  {
    id: 'abdomen_inf_esq',
    name: 'Abdômen inferior / Fossa ilíaca (E)',
    view: 'frente',
    category: 'tronco',
    description: 'Baixo ventre, mesogástrio e fossa ilíaca esquerda',
    center: { x: 368, y: 393 },
    path: 'M 344 358 L 344 428 L 395 425 L 392 379 L 393 362 L 359 357 Z'
  },
  {
    id: 'antebraco_frente_dir',
    name: 'Antebraço direito anterior',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Face flexora e anterior do antebraço direito',
    center: { x: 194, y: 415 },
    path: 'M 235 370 L 224 372 L 213 371 L 203 366 L 195 357 L 179 388 L 167 434 L 157 459 L 156 466 L 165 468 L 178 476 L 182 475 L 222 411 L 230 391 Z'
  },
  {
    id: 'antebraco_frente_esq',
    name: 'Antebraço esquerdo anterior',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Face flexora e anterior do antebraço esquerdo',
    center: { x: 489, y: 414 },
    path: 'M 448 369 L 453 391 L 461 411 L 501 475 L 505 476 L 515 468 L 528 464 L 517 437 L 504 388 L 489 358 L 486 359 L 479 367 L 470 371 L 458 372 Z'
  },
  {
    id: 'pelvis_frente_dir',
    name: 'Pélvis / Virilha (D)',
    view: 'frente',
    category: 'tronco',
    description: 'Região inguinal, púbica e virilha direita',
    center: { x: 297, y: 475 },
    path: 'M 266 419 L 252 464 L 247 494 L 248 504 L 264 512 L 297 521 L 322 525 L 335 524 L 337 521 L 340 521 L 340 432 L 324 432 L 322 430 L 283 427 Z'
  },
  {
    id: 'pelvis_frente_esq',
    name: 'Pélvis / Virilha (E)',
    view: 'frente',
    category: 'tronco',
    description: 'Região inguinal, púbica e virilha esquerda',
    center: { x: 387, y: 475 },
    path: 'M 416 418 L 406 425 L 400 427 L 396 426 L 388 430 L 344 432 L 344 521 L 349 522 L 349 524 L 361 525 L 406 516 L 424 510 L 437 503 L 432 468 L 426 445 Z'
  },
  {
    id: 'punho_frente_dir',
    name: 'Punho direito anterior',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Articulação do punho e túnel do carpo direito',
    center: { x: 164, y: 478 },
    path: 'M 155 467 L 148 479 L 173 491 L 179 479 L 175 475 Z'
  },
  {
    id: 'punho_frente_esq',
    name: 'Punho esquerdo anterior',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Articulação do punho e túnel do carpo esquerdo',
    center: { x: 519, y: 479 },
    path: 'M 529 468 L 517 472 L 514 471 L 508 475 L 504 480 L 510 491 L 517 486 L 535 479 Z'
  },
  {
    id: 'palma_frente_dir',
    name: 'Palma da mão direita',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Região palmar da mão direita',
    center: { x: 148, y: 507 },
    path: 'M 173 493 L 148 481 L 145 482 L 127 498 L 117 514 L 111 520 L 110 524 L 118 522 L 128 513 L 131 514 L 132 521 L 138 524 L 156 529 L 165 529 L 169 524 L 172 513 Z'
  },
  {
    id: 'palma_frente_esq',
    name: 'Palma da mão esquerda',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Região palmar da mão esquerda',
    center: { x: 535, y: 507 },
    path: 'M 510 493 L 510 508 L 517 530 L 536 527 L 547 523 L 552 519 L 553 513 L 556 513 L 566 523 L 573 524 L 573 521 L 563 510 L 556 498 L 538 482 L 535 481 Z'
  },
  {
    id: 'dedos_frente_dir',
    name: 'Dedos da mão direita',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Falanges dos dedos da mão direita',
    center: { x: 142, y: 544 },
    path: 'M 130 521 L 123 552 L 126 563 L 135 531 L 138 532 L 131 564 L 131 571 L 135 570 L 142 546 L 146 546 L 141 566 L 143 570 L 147 564 L 154 537 L 156 535 L 159 536 L 159 540 L 153 562 L 156 561 L 166 532 L 147 529 Z'
  },
  {
    id: 'dedos_frente_esq',
    name: 'Dedos da mão esquerda',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Falanges dos dedos da mão esquerda',
    center: { x: 541, y: 545 },
    path: 'M 552 521 L 540 528 L 517 532 L 527 561 L 530 562 L 524 539 L 525 535 L 529 538 L 538 568 L 542 569 L 534 537 L 535 534 L 539 536 L 548 570 L 552 570 L 552 563 L 545 537 L 546 531 L 549 532 L 557 563 L 560 563 L 559 546 Z'
  },
  {
    id: 'coxa_frente_dir',
    name: 'Coxa direita anterior',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Quadríceps e face anterior da coxa direita',
    center: { x: 288, y: 575 },
    path: 'M 246 507 L 245 549 L 247 572 L 254 612 L 262 641 L 279 637 L 300 637 L 319 642 L 321 639 L 322 618 L 332 564 L 334 528 L 323 528 L 321 526 L 284 520 L 256 511 L 250 507 Z'
  },
  {
    id: 'coxa_frente_esq',
    name: 'Coxa esquerda anterior',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Quadríceps e face anterior da coxa esquerda',
    center: { x: 395, y: 575 },
    path: 'M 437 506 L 406 518 L 380 524 L 362 526 L 360 528 L 349 528 L 351 563 L 361 617 L 363 641 L 367 639 L 371 640 L 390 636 L 407 637 L 420 642 L 422 639 L 430 608 L 437 564 Z'
  },
  {
    id: 'patela_dir',
    name: 'Joelho / Patela direita',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Rótula e face anterior do joelho direito',
    center: { x: 289, y: 669 },
    path: 'M 269 641 L 264 644 L 263 650 L 264 675 L 261 692 L 270 700 L 279 703 L 290 703 L 303 699 L 310 692 L 316 674 L 320 645 L 312 641 L 300 639 L 279 639 Z'
  },
  {
    id: 'patela_esq',
    name: 'Joelho / Patela esquerda',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Rótula e face anterior do joelho esquerdo',
    center: { x: 394, y: 669 },
    path: 'M 363 645 L 366 670 L 375 695 L 389 702 L 400 703 L 410 701 L 422 692 L 419 674 L 420 644 L 418 642 L 407 639 L 390 638 L 375 640 Z'
  },
  {
    id: 'perna_frente_dir',
    name: 'Canela / Perna direita anterior',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Tíbia e face anterior da perna direita',
    center: { x: 281, y: 768 },
    path: 'M 260 693 L 253 718 L 250 737 L 251 772 L 265 849 L 273 852 L 283 852 L 294 848 L 299 811 L 312 764 L 313 733 L 309 709 L 309 697 L 295 704 L 279 705 L 270 702 Z'
  },
  {
    id: 'perna_frente_esq',
    name: 'Canela / Perna esquerda anterior',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Tíbia e face anterior da perna esquerda',
    center: { x: 402, y: 767 },
    path: 'M 423 693 L 414 701 L 400 705 L 383 702 L 374 696 L 374 709 L 370 733 L 370 758 L 384 810 L 389 848 L 396 850 L 414 850 L 419 848 L 426 799 L 433 765 L 433 736 L 429 713 Z'
  },
  {
    id: 'tornozelo_frente_dir',
    name: 'Tornozelo direito anterior',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Articulação anterior do tornozelo direito',
    center: { x: 279, y: 870 },
    path: 'M 292 851 L 283 854 L 265 853 L 266 885 L 280 888 L 291 886 L 295 883 Z'
  },
  {
    id: 'tornozelo_frente_esq',
    name: 'Tornozelo esquerdo anterior',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Articulação anterior do tornozelo esquerdo',
    center: { x: 404, y: 870 },
    path: 'M 390 852 L 390 867 L 388 875 L 389 883 L 396 887 L 411 887 L 417 884 L 418 853 L 402 855 Z'
  },
  {
    id: 'pe_frente_dir',
    name: 'Dorso do pé e dedos direitos',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Peito do pé e dedos do pé direito',
    center: { x: 270, y: 923 },
    path: 'M 295 887 L 293 886 L 291 888 L 280 890 L 265 887 L 259 907 L 253 919 L 240 937 L 239 943 L 244 951 L 253 956 L 266 958 L 276 954 L 284 945 L 287 939 L 291 919 L 297 908 Z'
  },
  {
    id: 'pe_frente_esq',
    name: 'Dorso do pé e dedos esquerdos',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Peito do pé e dedos do pé esquerdo',
    center: { x: 413, y: 923 },
    path: 'M 388 887 L 386 907 L 393 921 L 395 935 L 400 946 L 413 957 L 430 956 L 439 951 L 443 947 L 444 940 L 441 933 L 429 917 L 418 888 L 396 889 L 393 887 Z'
  },

  // ==========================================================================
  // --- VISÃO POSTERIOR (COSTAS) ---
  // ==========================================================================
  {
    id: 'cabeca_costas_esq',
    name: 'Nuca / Cabeça posterior (E)',
    view: 'costas',
    category: 'cabeca',
    description: 'Região occipital esquerda e nuca',
    center: { x: 321, y: 65 },
    path: 'M 333 16 L 318 22 L 305 36 L 299 55 L 298 72 L 300 87 L 304 98 L 319 110 L 340 115 L 340 16 Z'
  },
  {
    id: 'cabeca_costas_dir',
    name: 'Nuca / Cabeça posterior (D)',
    view: 'costas',
    category: 'cabeca',
    description: 'Região occipital direita e nuca',
    center: { x: 360, y: 65 },
    path: 'M 343 16 L 343 114 L 352 114 L 367 108 L 379 97 L 384 77 L 384 57 L 380 41 L 375 32 L 361 20 L 349 16 Z'
  },
  {
    id: 'cervical_esq',
    name: 'Coluna cervical / Pescoço (E)',
    view: 'costas',
    category: 'cabeca',
    description: 'Região cervical posterior esquerda',
    center: { x: 324, y: 136 },
    path: 'M 304 101 L 313 127 L 313 145 L 308 158 L 340 162 L 340 117 L 322 114 L 310 107 Z'
  },
  {
    id: 'cervical_dir',
    name: 'Coluna cervical / Pescoço (D)',
    view: 'costas',
    category: 'cabeca',
    description: 'Região cervical posterior direita',
    center: { x: 358, y: 136 },
    path: 'M 378 102 L 365 112 L 354 116 L 343 117 L 343 162 L 360 161 L 375 157 L 370 147 L 369 135 L 370 126 L 373 121 Z'
  },
  {
    id: 'trapezio_esq',
    name: 'Trapézio / Dorso alto (E)',
    view: 'costas',
    category: 'tronco',
    description: 'Músculo trapézio e dorso superior esquerdo',
    center: { x: 308, y: 188 },
    path: 'M 265 182 L 274 204 L 300 207 L 328 216 L 340 218 L 340 164 L 326 164 L 305 160 L 291 170 Z'
  },
  {
    id: 'trapezio_dir',
    name: 'Trapézio / Dorso alto (D)',
    view: 'costas',
    category: 'tronco',
    description: 'Músculo trapézio e dorso superior direito',
    center: { x: 373, y: 188 },
    path: 'M 418 182 L 392 170 L 378 160 L 356 164 L 343 164 L 342 217 L 350 217 L 388 206 L 411 205 L 412 195 Z'
  },
  {
    id: 'ombro_esq_costas',
    name: 'Ombro esquerdo posterior',
    view: 'costas',
    category: 'membros_superiores',
    description: 'Articulação do ombro esquerdo (dorso)',
    center: { x: 242, y: 204 },
    path: 'M 264 185 L 259 184 L 242 190 L 234 195 L 223 208 L 214 234 L 225 225 L 245 213 L 269 205 L 268 194 Z'
  },
  {
    id: 'ombro_dir_costas',
    name: 'Ombro direito posterior',
    view: 'costas',
    category: 'membros_superiores',
    description: 'Articulação do ombro direito (dorso)',
    center: { x: 440, y: 204 },
    path: 'M 419 185 L 415 194 L 414 205 L 426 208 L 443 216 L 469 234 L 461 209 L 449 195 L 436 188 L 424 184 Z'
  },
  {
    id: 'escapula_esq',
    name: 'Escápula esquerda',
    view: 'costas',
    category: 'tronco',
    description: 'Omoplata e região infraescapular esquerda',
    center: { x: 288, y: 248 },
    path: 'M 271 207 L 261 241 L 260 265 L 262 273 L 268 283 L 281 295 L 287 297 L 304 286 L 309 280 L 316 249 L 318 215 L 297 209 Z'
  },
  {
    id: 'escapula_dir',
    name: 'Escápula direita',
    view: 'costas',
    category: 'tronco',
    description: 'Omoplata e região infraescapular direita',
    center: { x: 394, y: 248 },
    path: 'M 412 208 L 391 208 L 365 215 L 366 244 L 374 281 L 395 297 L 400 296 L 413 285 L 422 269 L 422 243 Z'
  },
  {
    id: 'braco_esq_costas',
    name: 'Braço esquerdo posterior',
    view: 'costas',
    category: 'membros_superiores',
    description: 'Tríceps e região posterior do braço esquerdo',
    center: { x: 232, y: 278 },
    path: 'M 268 208 L 253 212 L 239 219 L 213 238 L 212 259 L 204 291 L 199 330 L 221 337 L 244 336 L 254 309 L 258 290 L 258 268 L 254 249 L 255 245 L 258 253 L 260 233 Z'
  },
  {
    id: 'braco_dir_costas',
    name: 'Braço direito posterior',
    view: 'costas',
    category: 'membros_superiores',
    description: 'Tríceps e região posterior do braço direito',
    center: { x: 449, y: 278 },
    path: 'M 414 208 L 422 230 L 425 254 L 427 246 L 428 253 L 424 277 L 425 293 L 430 314 L 438 335 L 441 337 L 461 337 L 482 331 L 484 328 L 481 304 L 472 267 L 469 237 L 458 228 L 438 216 L 424 210 Z'
  },
  {
    id: 'dorsal_esq',
    name: 'Coluna torácica / Costas meio (E)',
    view: 'costas',
    category: 'tronco',
    description: 'Coluna dorsal média esquerda',
    center: { x: 319, y: 318 },
    path: 'M 321 216 L 318 253 L 311 282 L 304 289 L 287 300 L 298 362 L 299 400 L 317 395 L 340 393 L 340 220 Z'
  },
  {
    id: 'dorsal_dir',
    name: 'Coluna torácica / Costas meio (D)',
    view: 'costas',
    category: 'tronco',
    description: 'Coluna dorsal média direita',
    center: { x: 362, y: 318 },
    path: 'M 362 216 L 343 220 L 342 393 L 366 395 L 384 400 L 385 359 L 395 299 L 372 283 L 364 248 Z'
  },
  {
    id: 'flanco_esq_costas',
    name: 'Flanco / Costelas (E)',
    view: 'costas',
    category: 'tronco',
    description: 'Lateral esquerda do tronco e costelas inferiores',
    center: { x: 280, y: 348 },
    path: 'M 262 277 L 261 293 L 272 335 L 276 359 L 274 392 L 269 414 L 287 404 L 296 401 L 297 386 L 294 350 L 286 303 L 284 299 L 277 295 L 266 284 Z'
  },
  {
    id: 'flanco_dir_costas',
    name: 'Flanco / Costelas (D)',
    view: 'costas',
    category: 'tronco',
    description: 'Lateral direita do tronco e costelas inferiores',
    center: { x: 401, y: 348 },
    path: 'M 421 276 L 416 285 L 397 302 L 390 341 L 386 378 L 387 401 L 396 404 L 413 414 L 407 380 L 407 354 L 421 297 Z'
  },
  {
    id: 'cotovelo_esq_costas',
    name: 'Cotovelo esquerdo',
    view: 'costas',
    category: 'membros_superiores',
    description: 'Articulação do cotovelo esquerdo posterior',
    center: { x: 215, y: 354 },
    path: 'M 199 332 L 196 346 L 190 356 L 192 362 L 201 370 L 211 374 L 220 375 L 233 372 L 235 370 L 238 352 L 243 339 L 217 339 L 203 335 Z'
  },
  {
    id: 'cotovelo_dir_costas',
    name: 'Cotovelo direito',
    view: 'costas',
    category: 'membros_superiores',
    description: 'Articulação do cotovelo direito posterior',
    center: { x: 466, y: 354 },
    path: 'M 484 332 L 465 339 L 440 339 L 449 372 L 460 375 L 471 374 L 483 369 L 489 364 L 493 357 L 486 345 Z'
  },
  {
    id: 'antebraco_esq_costas',
    name: 'Antebraço esquerdo posterior',
    view: 'costas',
    category: 'membros_superiores',
    description: 'Dorso do antebraço esquerdo',
    center: { x: 188, y: 416 },
    path: 'M 188 360 L 176 383 L 164 426 L 150 464 L 160 470 L 177 476 L 187 458 L 219 411 L 233 375 L 227 377 L 214 377 L 206 375 L 197 370 Z'
  },
  {
    id: 'antebraco_dir_costas',
    name: 'Antebraço direito posterior',
    view: 'costas',
    category: 'membros_superiores',
    description: 'Dorso do antebraço direito',
    center: { x: 493, y: 416 },
    path: 'M 495 360 L 484 371 L 473 376 L 456 377 L 449 374 L 453 388 L 465 414 L 492 453 L 505 476 L 529 466 L 532 462 L 519 428 L 506 382 Z'
  },
  {
    id: 'lombar_esq',
    name: 'Região lombar / Sacra (E)',
    view: 'costas',
    category: 'tronco',
    description: 'Fundo das costas e lombar esquerda',
    center: { x: 319, y: 432 },
    path: 'M 277 412 L 302 438 L 322 465 L 332 483 L 340 507 L 340 396 L 310 399 Z'
  },
  {
    id: 'lombar_dir',
    name: 'Região lombar / Sacra (D)',
    view: 'costas',
    category: 'tronco',
    description: 'Fundo das costas e lombar direita',
    center: { x: 363, y: 432 },
    path: 'M 373 399 L 343 396 L 343 505 L 347 491 L 359 467 L 373 447 L 404 411 Z'
  },
  {
    id: 'gluteo_esq',
    name: 'Glúteo esquerdo',
    view: 'costas',
    category: 'tronco',
    description: 'Nádega e quadril posterior esquerdo',
    center: { x: 289, y: 478 },
    path: 'M 269 417 L 252 466 L 246 502 L 265 513 L 296 521 L 325 521 L 340 515 L 332 489 L 314 457 L 298 437 L 275 413 Z'
  },
  {
    id: 'gluteo_dir',
    name: 'Glúteo direito',
    view: 'costas',
    category: 'tronco',
    description: 'Nádega e quadril posterior direito',
    center: { x: 393, y: 478 },
    path: 'M 411 415 L 407 414 L 386 435 L 363 465 L 356 477 L 346 501 L 343 513 L 347 518 L 366 522 L 393 520 L 420 512 L 436 503 L 428 458 L 415 419 Z'
  },
  {
    id: 'punho_esq_costas',
    name: 'Punho esquerdo posterior',
    view: 'costas',
    category: 'membros_superiores',
    description: 'Articulação do punho esquerdo',
    center: { x: 159, y: 478 },
    path: 'M 149 466 L 143 478 L 158 487 L 171 490 L 176 478 L 161 473 Z'
  },
  {
    id: 'punho_dir_costas',
    name: 'Punho direito posterior',
    view: 'costas',
    category: 'membros_superiores',
    description: 'Articulação do punho direito',
    center: { x: 523, y: 478 },
    path: 'M 534 466 L 507 478 L 512 491 L 526 486 L 540 478 Z'
  },
  {
    id: 'mao_esq_costas',
    name: 'Mão esquerda (Dorso)',
    view: 'costas',
    category: 'membros_superiores',
    description: 'Dorso da mão esquerda',
    center: { x: 142, y: 507 },
    path: 'M 103 522 L 111 522 L 124 510 L 125 518 L 132 524 L 149 530 L 164 530 L 169 513 L 170 493 L 154 488 L 142 480 L 139 481 L 122 495 Z'
  },
  {
    id: 'mao_dir_costas',
    name: 'Mão direita (Dorso)',
    view: 'costas',
    category: 'membros_superiores',
    description: 'Dorso da mão direita',
    center: { x: 539, y: 507 },
    path: 'M 512 493 L 513 511 L 519 530 L 533 530 L 546 526 L 558 518 L 559 512 L 571 522 L 577 522 L 580 520 L 568 508 L 561 496 L 542 480 L 525 489 Z'
  },
  {
    id: 'dedos_esq_costas',
    name: 'Dedos da mão esquerda',
    view: 'costas',
    category: 'membros_superiores',
    description: 'Falanges da mão esquerda',
    center: { x: 136, y: 546 },
    path: 'M 124 521 L 116 554 L 117 564 L 121 563 L 130 533 L 133 533 L 125 563 L 126 572 L 131 570 L 139 540 L 143 537 L 136 564 L 140 570 L 145 560 L 150 541 L 154 539 L 148 559 L 149 563 L 153 561 L 162 533 L 146 532 L 137 529 Z'
  },
  {
    id: 'dedos_dir_costas',
    name: 'Dedos da mão direita',
    view: 'costas',
    category: 'membros_superiores',
    description: 'Falanges da mão direita',
    center: { x: 545, y: 546 },
    path: 'M 558 520 L 553 525 L 545 529 L 531 533 L 520 533 L 529 561 L 534 563 L 528 538 L 530 537 L 532 539 L 541 569 L 546 570 L 546 563 L 540 542 L 542 537 L 548 561 L 553 572 L 557 571 L 557 562 L 550 536 L 551 532 L 555 540 L 560 561 L 563 564 L 566 562 L 565 547 Z'
  },
  {
    id: 'coxa_esq_costas',
    name: 'Coxa esquerda posterior',
    view: 'costas',
    category: 'membros_inferiores',
    description: 'Isquiotibiais e posterior da coxa esquerda',
    center: { x: 288, y: 575 },
    path: 'M 246 505 L 245 551 L 252 602 L 263 645 L 276 639 L 288 637 L 306 638 L 321 644 L 324 615 L 335 552 L 336 521 L 325 524 L 292 523 L 266 516 Z'
  },
  {
    id: 'coxa_dir_costas',
    name: 'Coxa direita posterior',
    view: 'costas',
    category: 'membros_inferiores',
    description: 'Isquiotibiais e posterior da coxa direita',
    center: { x: 393, y: 575 },
    path: 'M 436 506 L 414 517 L 391 523 L 357 524 L 346 521 L 348 555 L 358 611 L 361 644 L 372 639 L 385 637 L 401 638 L 420 644 L 432 591 L 436 563 Z'
  },
  {
    id: 'joelho_esq_costas',
    name: 'Fossa poplítea / Joelho (E)',
    view: 'costas',
    category: 'membros_inferiores',
    description: 'Dobra posterior do joelho esquerdo',
    center: { x: 289, y: 674 },
    path: 'M 263 647 L 264 677 L 259 703 L 269 709 L 281 712 L 296 712 L 309 708 L 310 699 L 319 672 L 321 647 L 317 644 L 302 640 L 279 641 Z'
  },
  {
    id: 'joelho_dir_costas',
    name: 'Fossa poplítea / Joelho (D)',
    view: 'costas',
    category: 'membros_inferiores',
    description: 'Dobra posterior do joelho direito',
    center: { x: 392, y: 674 },
    path: 'M 362 646 L 363 670 L 372 699 L 373 708 L 386 712 L 401 712 L 413 709 L 423 703 L 418 676 L 419 647 L 411 643 L 398 640 L 380 640 Z'
  },
  {
    id: 'panturrilha_esq',
    name: 'Panturrilha esquerda',
    view: 'costas',
    category: 'membros_inferiores',
    description: 'Batata da perna e gastrocnêmio esquerdo',
    center: { x: 280, y: 782 },
    path: 'M 258 706 L 249 739 L 247 764 L 260 839 L 263 867 L 267 869 L 287 870 L 295 867 L 298 834 L 314 771 L 314 743 L 309 711 L 300 714 L 286 715 L 270 712 Z'
  },
  {
    id: 'panturrilha_dir',
    name: 'Panturrilha direita',
    view: 'costas',
    category: 'membros_inferiores',
    description: 'Batata da perna e gastrocnêmio direito',
    center: { x: 401, y: 781 },
    path: 'M 424 705 L 415 711 L 397 715 L 382 714 L 373 711 L 368 744 L 368 769 L 383 828 L 387 866 L 395 870 L 411 870 L 419 867 L 424 825 L 433 782 L 435 763 L 434 744 Z'
  },
  {
    id: 'tornozelo_esq_costas',
    name: 'Tornozelo esquerdo posterior',
    view: 'costas',
    category: 'membros_inferiores',
    description: 'Tendão de Aquiles e tornozelo esquerdo',
    center: { x: 278, y: 887 },
    path: 'M 263 870 L 262 898 L 264 900 L 273 903 L 285 903 L 295 899 L 295 870 L 285 873 L 273 873 Z'
  },
  {
    id: 'tornozelo_dir_costas',
    name: 'Tornozelo direito posterior',
    view: 'costas',
    category: 'membros_inferiores',
    description: 'Tendão de Aquiles e tornozelo direito',
    center: { x: 403, y: 886 },
    path: 'M 419 869 L 409 873 L 397 873 L 388 870 L 387 899 L 398 903 L 409 903 L 418 900 L 420 898 Z'
  },
  {
    id: 'pe_esq_costas',
    name: 'Calcanhar / Pé esquerdo',
    view: 'costas',
    category: 'membros_inferiores',
    description: 'Calcanhar e sola do pé esquerdo',
    center: { x: 272, y: 931 },
    path: 'M 262 901 L 257 917 L 257 930 L 255 927 L 255 915 L 245 920 L 241 924 L 239 933 L 242 938 L 252 945 L 264 958 L 272 961 L 283 961 L 289 959 L 294 953 L 295 934 L 298 925 L 295 902 L 277 906 L 270 905 Z'
  },
  {
    id: 'pe_dir_costas',
    name: 'Calcanhar / Pé direito',
    view: 'costas',
    category: 'membros_inferiores',
    description: 'Calcanhar e sola do pé direito',
    center: { x: 409, y: 931 },
    path: 'M 387 901 L 384 923 L 388 939 L 388 953 L 392 958 L 399 961 L 414 960 L 421 956 L 441 937 L 443 933 L 442 925 L 428 915 L 426 928 L 425 915 L 421 901 L 405 906 L 391 904 Z'
  },
];

export type OccurrenceType = 'dor' | 'edema' | 'lesao';

export interface OccurrenceConfig {
  type: OccurrenceType;
  label: string;
  icon: string;
  color: string;
  softColor: string;
  description: string;
}

export const OCCURRENCE_TYPES: Record<OccurrenceType, OccurrenceConfig> = {
  dor: {
    type: 'dor',
    label: 'Dor',
    icon: '',
    color: 'var(--danger)',
    softColor: 'var(--danger-soft)',
    description: 'Sensação dolorosa, pontada, queimação ou aperto'
  },
  edema: {
    type: 'edema',
    label: 'Inchaço (Edema)',
    icon: '',
    color: '#2563eb',
    softColor: '#eff6ff',
    description: 'Retenção de líquido, inchaço em pernas, braços ou abdômen'
  },
  lesao: {
    type: 'lesao',
    label: 'Ferida ou Lesão de pele',
    icon: '',
    color: '#7c3aed',
    softColor: '#f5f3ff',
    description: 'Lesão por pressão, vermelhidão, ferida tumoral ou bolhas'
  }
};
