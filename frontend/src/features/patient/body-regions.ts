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
  // --- VISÃO ANTERIOR (FRENTE) ---
  {
    id: 'cabeca_frente_dir',
    name: 'Cabeça / Face (D)',
    view: 'frente',
    category: 'cabeca',
    description: 'Testa, face e mandíbula direita',
    center: { x: 321, y: 83 },
    path: 'M 339 16 L 324 19 L 317 23 L 309 31 L 301 47 L 299 70 L 293 74 L 292 78 L 293 88 L 299 104 L 307 110 L 313 128 L 314 141 L 309 155 L 339 155 L 338 115 L 321 110 L 304 92 L 307 90 L 323 106 L 339 111 Z'
  },
  {
    id: 'cabeca_frente_esq',
    name: 'Cabeça / Face (E)',
    view: 'frente',
    category: 'cabeca',
    description: 'Testa, face e mandíbula esquerda',
    center: { x: 361, y: 83 },
    path: 'M 343 16 L 343 111 L 359 106 L 376 90 L 378 93 L 361 110 L 343 116 L 343 155 L 373 155 L 369 144 L 369 129 L 375 110 L 381 106 L 386 99 L 390 85 L 390 75 L 384 70 L 382 49 L 376 34 L 364 22 L 356 18 Z'
  },
  {
    id: 'torax_sup_dir',
    name: 'Clavícula / Tórax superior (D)',
    view: 'frente',
    category: 'tronco',
    description: 'Clavícula e peito superior direito',
    center: { x: 290, y: 207 },
    path: 'M 339 160 L 317 158 L 305 160 L 278 177 L 237 193 L 230 199 L 221 213 L 236 236 L 262 245 L 258 208 L 262 207 L 267 247 L 276 250 L 339 243 Z'
  },
  {
    id: 'torax_sup_esq',
    name: 'Clavícula / Tórax superior (E)',
    view: 'frente',
    category: 'tronco',
    description: 'Clavícula e peito superior esquerdo',
    center: { x: 391, y: 207 },
    path: 'M 343 160 L 343 243 L 396 249 L 413 248 L 416 244 L 419 210 L 422 206 L 424 208 L 420 245 L 446 236 L 459 215 L 462 213 L 454 200 L 446 193 L 409 179 L 377 160 L 368 158 Z'
  },
  {
    id: 'peitoral_dir',
    name: 'Peitoral / Tórax anterior (D)',
    view: 'frente',
    category: 'tronco',
    description: 'Músculo peitoral e costelas direitas',
    center: { x: 307, y: 277 },
    path: 'M 339 248 L 282 254 L 267 252 L 269 279 L 285 302 L 339 309 Z'
  },
  {
    id: 'peitoral_esq',
    name: 'Peitoral / Tórax anterior (E)',
    view: 'frente',
    category: 'tronco',
    description: 'Músculo peitoral e costelas esquerdas',
    center: { x: 374, y: 277 },
    path: 'M 343 248 L 343 309 L 397 302 L 413 279 L 415 252 L 400 254 Z'
  },
  {
    id: 'braco_frente_dir',
    name: 'Braço direito anterior (Bíceps)',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Bíceps e face anterior do braço direito',
    center: { x: 230, y: 289 },
    path: 'M 219 217 L 214 235 L 212 263 L 203 299 L 198 337 L 199 341 L 218 347 L 240 338 L 243 339 L 252 315 L 255 301 L 258 298 L 263 301 L 265 310 L 264 278 L 262 275 L 264 273 L 263 251 L 234 240 Z'
  },
  {
    id: 'braco_frente_esq',
    name: 'Braço esquerdo anterior (Bíceps)',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Bíceps e face anterior do braço esquerdo',
    center: { x: 451, y: 288 },
    path: 'M 464 216 L 448 240 L 419 251 L 418 273 L 420 276 L 418 278 L 417 312 L 419 301 L 424 298 L 428 302 L 432 319 L 440 338 L 464 347 L 485 340 L 479 295 L 471 264 L 469 235 Z'
  },
  {
    id: 'abdomen_sup_dir',
    name: 'Abdômen superior direito',
    view: 'frente',
    category: 'tronco',
    description: 'Hipocôndrio direito e estômago superior',
    center: { x: 304, y: 345 },
    path: 'M 269 286 L 270 329 L 276 353 L 275 383 L 339 387 L 339 367 L 335 362 L 339 357 L 339 314 L 284 307 Z'
  },
  {
    id: 'abdomen_sup_esq',
    name: 'Abdômen superior esquerdo',
    view: 'frente',
    category: 'tronco',
    description: 'Hipocôndrio esquerdo e estômago superior',
    center: { x: 377, y: 345 },
    path: 'M 413 286 L 398 307 L 343 314 L 343 357 L 347 362 L 343 367 L 343 387 L 407 383 L 406 359 L 412 331 Z'
  },
  {
    id: 'antebraco_frente_dir',
    name: 'Antebraço direito anterior',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Face anterior do antebraço direito',
    center: { x: 192, y: 407 },
    path: 'M 241 343 L 220 351 L 196 345 L 193 353 L 180 374 L 158 445 L 149 465 L 149 468 L 172 485 L 183 465 L 197 423 L 209 356 L 212 353 L 214 355 L 203 420 L 192 451 L 222 405 L 230 386 Z'
  },
  {
    id: 'antebraco_frente_esq',
    name: 'Antebraço esquerdo anterior',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Face anterior do antebraço esquerdo',
    center: { x: 489, y: 407 },
    path: 'M 442 343 L 451 381 L 459 402 L 470 422 L 489 449 L 479 420 L 468 355 L 472 354 L 485 423 L 499 465 L 510 485 L 534 467 L 525 447 L 505 380 L 486 344 L 462 351 Z'
  },
  {
    id: 'abdomen_inf_dir',
    name: 'Abdômen inferior / Virilha (D)',
    view: 'frente',
    category: 'tronco',
    description: 'Baixo ventre e fossa ilíaca direita',
    center: { x: 308, y: 424 },
    path: 'M 274 389 L 273 401 L 265 428 L 287 447 L 339 478 L 339 392 L 285 388 Z'
  },
  {
    id: 'abdomen_inf_esq',
    name: 'Abdômen inferior / Virilha (E)',
    view: 'frente',
    category: 'tronco',
    description: 'Baixo ventre e fossa ilíaca esquerda',
    center: { x: 374, y: 424 },
    path: 'M 408 388 L 343 392 L 343 478 L 395 447 L 417 428 L 412 412 Z'
  },
  {
    id: 'palma_frente_dir',
    name: 'Palma da mão direita',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Região palmar da mão direita, sem os dedos',
    center: { x: 143, y: 506 },
    path: 'M 146 471 L 143 478 L 121 497 L 104 522 L 110 522 L 120 514 L 125 517 L 125 520 L 140 523 L 163 518 L 164 522 L 143 527 L 136 527 L 126 524 L 123 525 L 132 541 L 145 544 L 158 541 L 168 515 L 170 489 Z'
  },
  {
    id: 'dedos_frente_dir',
    name: 'Dedos da mão direita',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Falanges dos dedos da mão direita',
    center: { x: 137, y: 556 },
    path: 'M 123 525 L 132 541 L 145 544 L 158 541 L 152 562 L 145 563 L 138 571 L 132 569 L 128 572 L 123 564 L 118 564 L 117 551 Z'
  },
  {
    id: 'palma_frente_esq',
    name: 'Palma da mão esquerda',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Região palmar da mão esquerda, sem os dedos',
    center: { x: 538, y: 506 },
    path: 'M 536 471 L 512 489 L 514 513 L 530 541 L 543 544 L 556 541 L 559 524 L 539 527 L 520 523 L 517 520 L 522 518 L 542 523 L 557 520 L 557 517 L 560 514 L 572 522 L 578 522 L 579 520 L 571 512 L 562 498 L 540 479 Z'
  },
  {
    id: 'dedos_frente_esq',
    name: 'Dedos da mão esquerda',
    view: 'frente',
    category: 'membros_superiores',
    description: 'Falanges dos dedos da mão esquerda',
    center: { x: 548, y: 556 },
    path: 'M 530 541 L 543 544 L 556 541 L 559 524 L 565 551 L 565 563 L 560 564 L 555 572 L 550 569 L 545 571 L 537 562 L 530 562 Z'
  },
  {
    id: 'coxa_frente_dir',
    name: 'Coxa direita anterior',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Quadríceps e face anterior da coxa direita',
    center: { x: 289, y: 543 },
    path: 'M 263 433 L 252 468 L 245 520 L 248 575 L 262 641 L 286 643 L 321 641 L 324 612 L 334 556 L 336 519 L 339 516 L 339 484 L 285 451 Z'
  },
  {
    id: 'coxa_frente_esq',
    name: 'Coxa esquerda anterior',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Quadríceps e face anterior da coxa esquerda',
    center: { x: 392, y: 543 },
    path: 'M 419 432 L 397 451 L 343 484 L 343 515 L 347 519 L 349 559 L 360 622 L 361 641 L 396 643 L 420 641 L 434 575 L 437 543 L 437 518 L 431 472 Z'
  },
  {
    id: 'patela_dir',
    name: 'Joelho / Patela direita',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Rótula e face anterior do joelho direito',
    center: { x: 288, y: 672 },
    path: 'M 287 653 L 278 658 L 275 663 L 273 673 L 278 686 L 289 691 L 298 686 L 301 681 L 303 671 L 298 658 Z'
  },
  {
    id: 'patela_esq',
    name: 'Joelho / Patela esquerda',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Rótula e face anterior do joelho esquerdo',
    center: { x: 394, y: 672 },
    path: 'M 393 653 L 384 658 L 381 663 L 379 673 L 384 686 L 395 691 L 404 686 L 407 681 L 409 671 L 404 658 Z'
  },
  {
    id: 'joelho_art_dir',
    name: 'Articulação joelho direito',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Linha articular e tendões do joelho direito',
    center: { x: 291, y: 679 },
    path: 'M 321 645 L 301 647 L 263 646 L 265 654 L 265 671 L 263 689 L 259 704 L 289 710 L 309 706 L 310 698 L 318 675 Z'
  },
  {
    id: 'joelho_art_esq',
    name: 'Articulação joelho esquerdo',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Linha articular e tendões do joelho esquerdo',
    center: { x: 391, y: 679 },
    path: 'M 362 645 L 365 678 L 373 705 L 375 707 L 394 710 L 423 704 L 419 689 L 417 667 L 419 646 L 381 647 Z'
  },
  {
    id: 'perna_frente_dir',
    name: 'Canela / Perna direita anterior',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Tíbia e canela da perna direita',
    center: { x: 279, y: 783 },
    path: 'M 309 711 L 284 714 L 262 709 L 257 710 L 249 740 L 248 773 L 258 823 L 263 868 L 265 874 L 278 880 L 293 874 L 299 826 L 313 774 L 314 748 L 309 720 Z'
  },
  {
    id: 'perna_frente_esq',
    name: 'Canela / Perna esquerda anterior',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Tíbia e canela da perna esquerda',
    center: { x: 402, y: 783 },
    path: 'M 424 709 L 398 714 L 374 711 L 369 740 L 369 774 L 382 821 L 389 874 L 404 880 L 417 874 L 419 867 L 423 829 L 434 771 L 433 741 Z'
  },
  {
    id: 'tornozelo_frente_dir',
    name: 'Tornozelo direito anterior',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Articulação do tornozelo direito',
    center: { x: 277, y: 903 },
    path: 'M 264 878 L 262 903 L 257 914 L 249 919 L 273 926 L 297 922 L 294 878 L 280 884 L 276 884 Z'
  },
  {
    id: 'tornozelo_frente_esq',
    name: 'Tornozelo esquerdo anterior',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Articulação do tornozelo esquerdo',
    center: { x: 404, y: 903 },
    path: 'M 388 878 L 385 922 L 411 925 L 433 919 L 425 914 L 422 909 L 418 878 L 406 884 L 402 884 Z'
  },
  {
    id: 'pe_frente_dir',
    name: 'Dorso do pé e dedos direitos',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Peito do pé e dedos do pé direito',
    center: { x: 269, y: 941 },
    path: 'M 240 926 L 239 931 L 241 937 L 264 958 L 272 961 L 283 961 L 293 955 L 294 937 L 297 926 L 270 930 L 244 921 Z'
  },
  {
    id: 'pe_frente_esq',
    name: 'Dorso do pé e dedos esquerdos',
    view: 'frente',
    category: 'membros_inferiores',
    description: 'Peito do pé e dedos do pé esquerdo',
    center: { x: 412, y: 941 },
    path: 'M 441 924 L 438 921 L 412 930 L 386 927 L 388 936 L 388 951 L 390 956 L 400 961 L 410 961 L 418 958 L 441 937 L 443 932 Z'
  },

  // --- VISÃO POSTERIOR (COSTAS) ---
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
