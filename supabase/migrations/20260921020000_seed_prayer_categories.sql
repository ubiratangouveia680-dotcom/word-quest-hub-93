-- ==============================================================================
-- MIGRATION: SEED DE CATEGORIAS DE ORAÇÃO E FUNÇÃO SEGURA DE AUTO-RECUPERAÇÃO
-- ==============================================================================

-- 1. Inserção Segura das Categorias de Oração e Comunidade (sem duplicar existentes)
INSERT INTO public.community_categories (id, name, description, icon, order_index) VALUES
  ('saude', 'Saúde', 'Pedidos de oração por cura, saúde física e emocional', '🏥', 1),
  ('familia', 'Família', 'Pedidos pelo lar, casamento, filhos e parentes', '👨‍👩‍👧', 2),
  ('vida-financeira', 'Vida financeira', 'Pedidos por provisão, finanças e bênçãos materiais', '💰', 3),
  ('trabalho', 'Trabalho', 'Pedidos por emprego, negócios, carreira e vocação', '💼', 4),
  ('relacionamentos', 'Relacionamentos', 'Pedidos por reconciliação, amizades e relacionamentos', '🤝', 5),
  ('vida-espiritual', 'Vida espiritual', 'Pedidos por crescimento na fé, comunhão e firmeza', '🕊️', 6),
  ('agradecimento', 'Agradecimento', 'Louvor e ações de graças pelas bênçãos e vitórias recebidas', '🙌', 7),
  ('outros', 'Outros', 'Outros pedidos de oração e intercessão cristã', '🙏', 8),
  ('oracao', 'Oração', 'Pedidos de oração em geral e intercessão comunitária', '🙏', 9),
  ('biblia', 'Bíblia', 'Perguntas e reflexões sobre passagens e capítulos da Bíblia', '📖', 10),
  ('geral', 'Geral', 'Conversas edificantes e comunhão fraterna', '📌', 11)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = COALESCE(community_categories.description, EXCLUDED.description),
  icon = COALESCE(community_categories.icon, EXCLUDED.icon),
  order_index = EXCLUDED.order_index;

-- 2. Permissões de Leitura
GRANT SELECT ON public.community_categories TO anon, authenticated, service_role;

-- 3. Função RPC com SECURITY DEFINER para garantir que o cliente possa auto-semear caso a tabela esteja vazia
CREATE OR REPLACE FUNCTION public.ensure_default_community_categories()
RETURNS SETOF public.community_categories
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.community_categories (id, name, description, icon, order_index) VALUES
    ('saude', 'Saúde', 'Pedidos de oração por cura, saúde física e emocional', '🏥', 1),
    ('familia', 'Família', 'Pedidos pelo lar, casamento, filhos e parentes', '👨‍👩‍👧', 2),
    ('vida-financeira', 'Vida financeira', 'Pedidos por provisão, finanças e bênçãos materiais', '💰', 3),
    ('trabalho', 'Trabalho', 'Pedidos por emprego, negócios, carreira e vocação', '💼', 4),
    ('relacionamentos', 'Relacionamentos', 'Pedidos por reconciliação, amizades e relacionamentos', '🤝', 5),
    ('vida-espiritual', 'Vida espiritual', 'Pedidos por crescimento na fé, comunhão e firmeza', '🕊️', 6),
    ('agradecimento', 'Agradecimento', 'Louvor e ações de graças pelas bênçãos e vitórias recebidas', '🙌', 7),
    ('outros', 'Outros', 'Outros pedidos de oração e intercessão cristã', '🙏', 8),
    ('oracao', 'Oração', 'Pedidos de oração em geral e intercessão comunitária', '🙏', 9),
    ('biblia', 'Bíblia', 'Perguntas e reflexões sobre passagens e capítulos da Bíblia', '📖', 10),
    ('geral', 'Geral', 'Conversas edificantes e comunhão fraterna', '📌', 11)
  ON CONFLICT (id) DO NOTHING;

  RETURN QUERY SELECT * FROM public.community_categories ORDER BY order_index ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_default_community_categories() TO anon, authenticated, service_role;
