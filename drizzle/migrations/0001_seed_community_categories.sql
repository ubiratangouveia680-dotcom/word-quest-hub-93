INSERT INTO public.community_categories (id, name, description, icon, order_index) VALUES
  ('oracao', 'Pedido de oração', 'Compartilhe suas súplicas e receba orações dos irmãos', '🙏', 1),
  ('biblia', 'Versículo', 'Passagens bíblicas que tocaram o seu coração', '📖', 2),
  ('fe', 'Reflexão', 'Pensamentos sobre a vida diária e a aplicação da Palavra', '💭', 3),
  ('vida-crista', 'Testemunho', 'O que o Senhor tem feito e transformado em sua vida', '❤️', 4),
  ('duvidas', 'Pergunta', 'Dúvidas sobre passagens bíblicas, história ou fé', '❓', 5),
  ('geral', 'Devocional', 'Meditações para nutrir e edificar a comunhão diária', '🌅', 6)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
