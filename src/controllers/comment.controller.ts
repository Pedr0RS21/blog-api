import type { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { Comment } from '../entity/Comment.js';
import { Post } from '../entity/Post.js';
import { User } from '../entity/User.js';

function toDTO(c: Comment) {
  return {
    id: c.id,
    content: c.content,
    author: c.author ? {
      id: c.author.id,
      name: c.author.name,
      userName: c.author.userName,
      email: c.author.email,
    } : null,
    post: c.post ? {
      id: c.post.id,
      title: c.post.title,
    } : null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export class CommentController {
  /** POST /api/comentarios (crear comentario) */
  static crearComentario = async (req: Request, res: Response) => {
    try {
      const { content, authorId, postId } = req.body as {
        content: string;
        authorId: number;
        postId: number;
      };

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'El contenido del comentario es obligatorio.' });
      }

      if (!authorId || !Number.isInteger(authorId) || authorId <= 0) {
        return res.status(400).json({ error: 'El ID del autor es inválido.' });
      }

      if (!postId || !Number.isInteger(postId) || postId <= 0) {
        return res.status(400).json({ error: 'El ID del post es inválido.' });
      }

      const userRepo = AppDataSource.getRepository(User);
      const postRepo = AppDataSource.getRepository(Post);
      const commentRepo = AppDataSource.getRepository(Comment);

      const author = await userRepo.findOne({ where: { id: authorId, activo: true } });
      if (!author) {
        return res.status(404).json({ error: 'Autor no encontrado o inactivo.' });
      }

      const post = await postRepo.findOne({ where: { id: postId } });
      if (!post) {
        return res.status(404).json({ error: 'Post no encontrado.' });
      }

      const comment = new Comment();
      comment.content = content.trim();
      comment.author = author;
      comment.post = post;

      await commentRepo.save(comment);
      return res.status(201).json(toDTO(comment));
    } catch (error) {
      console.error('[CommentController.crearComentario]', error);
      return res.status(500).json({ error: 'Ocurrió un error al crear el comentario.' });
    }
  };

  /** GET /api/comentarios (listar todos) */
  static obtenerComentarios = async (_req: Request, res: Response) => {
    try {
      const repo = AppDataSource.getRepository(Comment);
      const comentarios = await repo.find({
        relations: ['author', 'post'],
        order: { createdAt: 'DESC' },
      });
      return res.status(200).json(comentarios.map(toDTO));
    } catch (error) {
      console.error('[CommentController.obtenerComentarios]', error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener los comentarios.' });
    }
  };

  /** GET /api/comentarios/:idComentario */
  static obtenerComentarioPorId = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idComentario);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const repo = AppDataSource.getRepository(Comment);
      const comentario = await repo.findOne({
        where: { id },
        relations: ['author', 'post'],
      });

      if (!comentario) {
        return res.status(404).json({ error: 'Comentario no encontrado' });
      }

      return res.status(200).json(toDTO(comentario));
    } catch (error) {
      console.error('[CommentController.obtenerComentarioPorId]', error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener el comentario.' });
    }
  };

  /** PUT /api/comentarios/:idComentario (editar) */
  static editarComentario = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idComentario);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const { content } = req.body as {
        content?: string;
      };

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'El contenido del comentario no puede estar vacío.' });
      }

      const repo = AppDataSource.getRepository(Comment);
      const comentario = await repo.findOne({
        where: { id },
        relations: ['author', 'post'],
      });

      if (!comentario) {
        return res.status(404).json({ error: 'Comentario no encontrado' });
      }

      comentario.content = content.trim();
      await repo.save(comentario);

      return res.status(200).json(toDTO(comentario));
    } catch (error) {
      console.error('[CommentController.editarComentario]', error);
      return res.status(500).json({ error: 'Ocurrió un error al editar el comentario.' });
    }
  };

  /** DELETE /api/comentarios/:idComentario */
  static eliminarComentario = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idComentario);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const repo = AppDataSource.getRepository(Comment);
      const comentario = await repo.findOne({ where: { id } });

      if (!comentario) {
        return res.status(404).json({ error: 'Comentario no encontrado' });
      }

      await repo.remove(comentario);
      return res.status(200).json({ success: true, message: 'Comentario eliminado exitosamente' });
    } catch (error) {
      console.error('[CommentController.eliminarComentario]', error);
      return res.status(500).json({ error: 'Ocurrió un error al eliminar el comentario.' });
    }
  };

  /** GET /api/comentarios/post/:idPost (listar comentarios de un post) */
  static obtenerComentariosPorPost = async (req: Request, res: Response) => {
    try {
      const idPost = Number(req.params.idPost);
      if (!Number.isInteger(idPost) || idPost <= 0) {
        return res.status(400).json({ error: 'ID del post inválido' });
      }

      const postRepo = AppDataSource.getRepository(Post);
      const post = await postRepo.findOne({ where: { id: idPost } });

      if (!post) {
        return res.status(404).json({ error: 'Post no encontrado' });
      }

      const repo = AppDataSource.getRepository(Comment);
      const comentarios = await repo.find({
        where: { post: { id: idPost } },
        relations: ['author', 'post'],
        order: { createdAt: 'DESC' },
      });

      return res.status(200).json({
        success: true,
        data: comentarios.map(toDTO),
        total: comentarios.length,
      });
    } catch (error) {
      console.error('[CommentController.obtenerComentariosPorPost]', error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener los comentarios del post.' });
    }
  };

  /** GET /api/comentarios/usuario/:idUsuario (listar comentarios de un usuario) */
  static obtenerComentariosPorUsuario = async (req: Request, res: Response) => {
    try {
      const idUsuario = Number(req.params.idUsuario);
      if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
        return res.status(400).json({ error: 'ID del usuario inválido' });
      }

      const userRepo = AppDataSource.getRepository(User);
      const usuario = await userRepo.findOne({ where: { id: idUsuario, activo: true } });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado o inactivo' });
      }

      const repo = AppDataSource.getRepository(Comment);
      const comentarios = await repo.find({
        where: { author: { id: idUsuario } },
        relations: ['author', 'post'],
        order: { createdAt: 'DESC' },
      });

      return res.status(200).json({
        success: true,
        data: comentarios.map(toDTO),
        total: comentarios.length,
      });
    } catch (error) {
      console.error('[CommentController.obtenerComentariosPorUsuario]', error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener los comentarios del usuario.' });
    }
  };

  /** GET /api/comentarios/post/:idPost/recientes?limit=10 (comentarios recientes de un post) */
  static obtenerComentariosRecientesPorPost = async (req: Request, res: Response) => {
    try {
      const idPost = Number(req.params.idPost);
      const limit = Math.min(Number(req.query.limit) || 10, 100); // Máximo 100

      if (!Number.isInteger(idPost) || idPost <= 0) {
        return res.status(400).json({ error: 'ID del post inválido' });
      }

      const postRepo = AppDataSource.getRepository(Post);
      const post = await postRepo.findOne({ where: { id: idPost } });

      if (!post) {
        return res.status(404).json({ error: 'Post no encontrado' });
      }

      const repo = AppDataSource.getRepository(Comment);
      const comentarios = await repo.find({
        where: { post: { id: idPost } },
        relations: ['author', 'post'],
        order: { createdAt: 'DESC' },
        take: limit,
      });

      return res.status(200).json({
        success: true,
        data: comentarios.map(toDTO),
        total: comentarios.length,
        limit,
      });
    } catch (error) {
      console.error('[CommentController.obtenerComentariosRecientesPorPost]', error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener los comentarios recientes.' });
    }
  };

  /** POST /api/comentarios/:idComentario/responder (responder a un comentario - crear nuevo comentario) */
  static responderComentario = async (req: Request, res: Response) => {
    try {
      const idComentarioOriginal = Number(req.params.idComentario);
      const { content, authorId } = req.body as {
        content: string;
        authorId: number;
      };

      if (!Number.isInteger(idComentarioOriginal) || idComentarioOriginal <= 0) {
        return res.status(400).json({ error: 'ID del comentario inválido' });
      }

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'El contenido de la respuesta es obligatorio.' });
      }

      if (!authorId || !Number.isInteger(authorId) || authorId <= 0) {
        return res.status(400).json({ error: 'El ID del autor es inválido.' });
      }

      const commentRepo = AppDataSource.getRepository(Comment);
      const userRepo = AppDataSource.getRepository(User);

      const comentarioOriginal = await commentRepo.findOne({
        where: { id: idComentarioOriginal },
        relations: ['post'],
      });

      if (!comentarioOriginal) {
        return res.status(404).json({ error: 'Comentario original no encontrado' });
      }

      const author = await userRepo.findOne({ where: { id: authorId, activo: true } });
      if (!author) {
        return res.status(404).json({ error: 'Autor no encontrado o inactivo.' });
      }

      const nuevoComentario = new Comment();
      nuevoComentario.content = content.trim();
      nuevoComentario.author = author;
      nuevoComentario.post = comentarioOriginal.post;

      await commentRepo.save(nuevoComentario);

      return res.status(201).json({
        success: true,
        message: 'Respuesta creada exitosamente',
        data: toDTO(nuevoComentario),
        respondingTo: idComentarioOriginal,
      });
    } catch (error) {
      console.error('[CommentController.responderComentario]', error);
      return res.status(500).json({ error: 'Ocurrió un error al responder el comentario.' });
    }
  };
}