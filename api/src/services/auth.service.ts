import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';
import { funcionarioRepository } from '../repositories/funcionario.repository';

export const authService = {
  async login(usuario: string, senha: string) {
    const funcionario = await funcionarioRepository.findByUsuario(usuario);
    if (!funcionario) {
      throw new AppError('Usuário ou senha inválidos', 401);
    }

    const senhaValida = await bcrypt.compare(senha, funcionario.senhaHash);
    if (!senhaValida) {
      throw new AppError('Usuário ou senha inválidos', 401);
    }

    const token = jwt.sign(
      {
        id: funcionario.id,
        usuario: funcionario.usuario,
        nivelPermissao: funcionario.nivelPermissao,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions,
    );

    return {
      token,
      funcionario: {
        id: funcionario.id,
        nome: funcionario.nome,
        usuario: funcionario.usuario,
        nivelPermissao: funcionario.nivelPermissao,
      },
    };
  },
};
