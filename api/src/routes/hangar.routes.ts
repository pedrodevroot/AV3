import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    mensagem: 'Você encontrou o hangar secreto da Aerocode!',
    aeronave: 'AV-EASTER-001',
    modelo: 'Embraer E-GG 404',
    status: 'Pronta para decolar',
    piloto: 'Você — por ter curiosidade suficiente para encontrar isso',
    combustivel: '100% café ☕',
    destino: 'Aprovação na AV3',
    altitude: '9001 metros',
    velocidade: 'Warp 9',
    coordenadas: {
      lat: -15.7801,
      lng: -47.9292,
    },
    mensagemSecreta:
      'Se você chegou até aqui, sabe que um bom sistema tem que ter alma. Bem-vindo ao Aerocode.',
  });
});

export default router;
