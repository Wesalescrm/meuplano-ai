-- =============================================
-- SEED: Dados iniciais de operadoras e planos (MVP)
-- =============================================

-- Operadoras
INSERT INTO public.operadoras (id, nome, ans_registro, site, ativa, estados) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Amil Assistência Médica', '326305', 'https://www.amil.com.br', TRUE, ARRAY['SP','RJ','MG','RS','PR','SC','BA','PE','CE','GO','DF']),
  ('22222222-2222-2222-2222-222222222222', 'SulAmérica Saúde', '005711', 'https://portal.sulamerica.com.br', TRUE, ARRAY['SP','RJ','MG','RS','PR','SC','BA','PE','CE','GO','DF']),
  ('33333333-3333-3333-3333-333333333333', 'Bradesco Saúde', '005932', 'https://www.bradescosaude.com.br', TRUE, ARRAY['SP','RJ','MG','RS','PR','SC','BA','PE','CE','GO','DF','AM','PA']),
  ('44444444-4444-4444-4444-444444444444', 'Hapvida Saúde', '368253', 'https://www.hapvida.com.br', TRUE, ARRAY['CE','PE','BA','MA','PI','RN','PB','AL','SE','GO','DF','MG','SP']),
  ('55555555-5555-5555-5555-555555555555', 'NotreDame Intermédica', '359017', 'https://www.gndi.com.br', TRUE, ARRAY['SP','RJ','MG','RS','PR','SC','GO','DF']);

-- Planos Amil
INSERT INTO public.planos (id, operadora_id, nome, tipo, abrangencia, modalidade, coparticipacao, coparticipacao_percentual, coberturas, carencias, reembolso, telemedicina, ativo, ans_codigo) VALUES
  (
    'aaaa0001-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Amil One 100',
    'individual',
    'nacional',
    'apartamento',
    FALSE,
    NULL,
    '["Consultas ilimitadas","Exames de rotina","Internação em apartamento","Cirurgias","UTI","Parto","Urgência 24h","Telemedicina","Reembolso parcial"]',
    '{"consultas": 0, "exames_simples": 30, "exames_complexos": 180, "internacao": 180, "parto": 300, "urgencia": 24}',
    TRUE,
    TRUE,
    TRUE,
    'ANS-AMIL-100'
  ),
  (
    'aaaa0002-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Amil 400',
    'individual',
    'estadual',
    'enfermaria',
    TRUE,
    30,
    '["Consultas com coparticipação","Exames de rotina","Internação em enfermaria","Cirurgias","UTI","Urgência 24h"]',
    '{"consultas": 0, "exames_simples": 30, "exames_complexos": 180, "internacao": 180, "parto": 300, "urgencia": 24}',
    FALSE,
    FALSE,
    TRUE,
    'ANS-AMIL-400'
  );

-- Planos SulAmérica
INSERT INTO public.planos (id, operadora_id, nome, tipo, abrangencia, modalidade, coparticipacao, coparticipacao_percentual, coberturas, carencias, reembolso, telemedicina, ativo, ans_codigo) VALUES
  (
    'bbbb0001-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'SulAmérica Clássico',
    'individual',
    'nacional',
    'enfermaria',
    FALSE,
    NULL,
    '["Consultas ilimitadas","Exames de rotina","Internação em enfermaria","Cirurgias","UTI","Parto","Urgência 24h"]',
    '{"consultas": 0, "exames_simples": 30, "exames_complexos": 180, "internacao": 180, "parto": 300, "urgencia": 24}',
    FALSE,
    TRUE,
    TRUE,
    'ANS-SULA-CLS'
  ),
  (
    'bbbb0002-0000-0000-0000-000000000002',
    '22222222-2222-2222-2222-222222222222',
    'SulAmérica Especial',
    'familiar',
    'nacional',
    'apartamento',
    FALSE,
    NULL,
    '["Consultas ilimitadas","Exames completos","Internação em apartamento","Cirurgias","UTI","Parto","Urgência 24h","Telemedicina","Reembolso"]',
    '{"consultas": 0, "exames_simples": 30, "exames_complexos": 180, "internacao": 180, "parto": 300, "urgencia": 24}',
    TRUE,
    TRUE,
    TRUE,
    'ANS-SULA-ESP'
  );

-- Planos Bradesco
INSERT INTO public.planos (id, operadora_id, nome, tipo, abrangencia, modalidade, coparticipacao, coparticipacao_percentual, coberturas, carencias, reembolso, telemedicina, ativo, ans_codigo) VALUES
  (
    'cccc0001-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'Bradesco Top Nacional',
    'individual',
    'nacional',
    'apartamento',
    FALSE,
    NULL,
    '["Consultas ilimitadas","Exames completos","Check-up anual","Internação em apartamento","Cirurgias","UTI","Parto","Urgência 24h","Telemedicina","Reembolso total"]',
    '{"consultas": 0, "exames_simples": 0, "exames_complexos": 90, "internacao": 180, "parto": 300, "urgencia": 0}',
    TRUE,
    TRUE,
    TRUE,
    'ANS-BRAD-TOP'
  ),
  (
    'cccc0002-0000-0000-0000-000000000002',
    '33333333-3333-3333-3333-333333333333',
    'Bradesco Efetivo',
    'individual',
    'estadual',
    'enfermaria',
    TRUE,
    20,
    '["Consultas com coparticipação","Exames básicos","Internação em enfermaria","Cirurgias","UTI","Urgência 24h"]',
    '{"consultas": 0, "exames_simples": 30, "exames_complexos": 180, "internacao": 180, "parto": 300, "urgencia": 24}',
    FALSE,
    FALSE,
    TRUE,
    'ANS-BRAD-EFT'
  );

-- Planos Hapvida
INSERT INTO public.planos (id, operadora_id, nome, tipo, abrangencia, modalidade, coparticipacao, coparticipacao_percentual, coberturas, carencias, reembolso, telemedicina, ativo, ans_codigo) VALUES
  (
    'dddd0001-0000-0000-0000-000000000001',
    '44444444-4444-4444-4444-444444444444',
    'Hapvida Essencial',
    'individual',
    'estadual',
    'enfermaria',
    FALSE,
    NULL,
    '["Consultas ilimitadas","Exames de rotina","Internação em enfermaria","Cirurgias","UTI","Urgência 24h","Telemedicina"]',
    '{"consultas": 0, "exames_simples": 30, "exames_complexos": 180, "internacao": 180, "parto": 300, "urgencia": 24}',
    FALSE,
    TRUE,
    TRUE,
    'ANS-HAPV-ESS'
  ),
  (
    'dddd0002-0000-0000-0000-000000000002',
    '44444444-4444-4444-4444-444444444444',
    'Hapvida Plus',
    'familiar',
    'nacional',
    'enfermaria',
    FALSE,
    NULL,
    '["Consultas ilimitadas","Exames completos","Internação em enfermaria","Cirurgias","UTI","Parto","Urgência 24h","Telemedicina"]',
    '{"consultas": 0, "exames_simples": 30, "exames_complexos": 180, "internacao": 180, "parto": 300, "urgencia": 24}',
    FALSE,
    TRUE,
    TRUE,
    'ANS-HAPV-PLU'
  );

-- Plano NotreDame
INSERT INTO public.planos (id, operadora_id, nome, tipo, abrangencia, modalidade, coparticipacao, coparticipacao_percentual, coberturas, carencias, reembolso, telemedicina, ativo, ans_codigo) VALUES
  (
    'eeee0001-0000-0000-0000-000000000001',
    '55555555-5555-5555-5555-555555555555',
    'Intermédica Pleno',
    'individual',
    'estadual',
    'enfermaria',
    FALSE,
    NULL,
    '["Consultas ilimitadas","Exames de rotina","Internação em enfermaria","Cirurgias","UTI","Urgência 24h","Telemedicina"]',
    '{"consultas": 0, "exames_simples": 30, "exames_complexos": 180, "internacao": 180, "parto": 300, "urgencia": 24}',
    FALSE,
    TRUE,
    TRUE,
    'ANS-GNDI-PLN'
  );

-- =============================================
-- Preços por faixa etária — SP (exemplo)
-- =============================================

-- Amil One 100 (SP)
INSERT INTO public.precos_por_faixa (plano_id, faixa_etaria_min, faixa_etaria_max, estado, cidade, preco_mensal) VALUES
  ('aaaa0001-0000-0000-0000-000000000001', 0, 18, 'SP', NULL, 320.00),
  ('aaaa0001-0000-0000-0000-000000000001', 19, 23, 'SP', NULL, 380.00),
  ('aaaa0001-0000-0000-0000-000000000001', 24, 28, 'SP', NULL, 420.00),
  ('aaaa0001-0000-0000-0000-000000000001', 29, 33, 'SP', NULL, 480.00),
  ('aaaa0001-0000-0000-0000-000000000001', 34, 38, 'SP', NULL, 560.00),
  ('aaaa0001-0000-0000-0000-000000000001', 39, 43, 'SP', NULL, 660.00),
  ('aaaa0001-0000-0000-0000-000000000001', 44, 48, 'SP', NULL, 780.00),
  ('aaaa0001-0000-0000-0000-000000000001', 49, 53, 'SP', NULL, 950.00),
  ('aaaa0001-0000-0000-0000-000000000001', 54, 58, 'SP', NULL, 1150.00),
  ('aaaa0001-0000-0000-0000-000000000001', 59, 999, 'SP', NULL, 1450.00);

-- Amil 400 (SP)
INSERT INTO public.precos_por_faixa (plano_id, faixa_etaria_min, faixa_etaria_max, estado, cidade, preco_mensal) VALUES
  ('aaaa0002-0000-0000-0000-000000000002', 0, 18, 'SP', NULL, 190.00),
  ('aaaa0002-0000-0000-0000-000000000002', 19, 23, 'SP', NULL, 220.00),
  ('aaaa0002-0000-0000-0000-000000000002', 24, 28, 'SP', NULL, 260.00),
  ('aaaa0002-0000-0000-0000-000000000002', 29, 33, 'SP', NULL, 300.00),
  ('aaaa0002-0000-0000-0000-000000000002', 34, 38, 'SP', NULL, 360.00),
  ('aaaa0002-0000-0000-0000-000000000002', 39, 43, 'SP', NULL, 420.00),
  ('aaaa0002-0000-0000-0000-000000000002', 44, 48, 'SP', NULL, 510.00),
  ('aaaa0002-0000-0000-0000-000000000002', 49, 53, 'SP', NULL, 620.00),
  ('aaaa0002-0000-0000-0000-000000000002', 54, 58, 'SP', NULL, 780.00),
  ('aaaa0002-0000-0000-0000-000000000002', 59, 999, 'SP', NULL, 980.00);

-- SulAmérica Clássico (SP)
INSERT INTO public.precos_por_faixa (plano_id, faixa_etaria_min, faixa_etaria_max, estado, cidade, preco_mensal) VALUES
  ('bbbb0001-0000-0000-0000-000000000001', 0, 18, 'SP', NULL, 210.00),
  ('bbbb0001-0000-0000-0000-000000000001', 19, 23, 'SP', NULL, 250.00),
  ('bbbb0001-0000-0000-0000-000000000001', 24, 28, 'SP', NULL, 290.00),
  ('bbbb0001-0000-0000-0000-000000000001', 29, 33, 'SP', NULL, 340.00),
  ('bbbb0001-0000-0000-0000-000000000001', 34, 38, 'SP', NULL, 400.00),
  ('bbbb0001-0000-0000-0000-000000000001', 39, 43, 'SP', NULL, 470.00),
  ('bbbb0001-0000-0000-0000-000000000001', 44, 48, 'SP', NULL, 560.00),
  ('bbbb0001-0000-0000-0000-000000000001', 49, 53, 'SP', NULL, 680.00),
  ('bbbb0001-0000-0000-0000-000000000001', 54, 58, 'SP', NULL, 830.00),
  ('bbbb0001-0000-0000-0000-000000000001', 59, 999, 'SP', NULL, 1050.00);

-- SulAmérica Especial (SP)
INSERT INTO public.precos_por_faixa (plano_id, faixa_etaria_min, faixa_etaria_max, estado, cidade, preco_mensal) VALUES
  ('bbbb0002-0000-0000-0000-000000000002', 0, 18, 'SP', NULL, 380.00),
  ('bbbb0002-0000-0000-0000-000000000002', 19, 23, 'SP', NULL, 450.00),
  ('bbbb0002-0000-0000-0000-000000000002', 24, 28, 'SP', NULL, 520.00),
  ('bbbb0002-0000-0000-0000-000000000002', 29, 33, 'SP', NULL, 610.00),
  ('bbbb0002-0000-0000-0000-000000000002', 34, 38, 'SP', NULL, 720.00),
  ('bbbb0002-0000-0000-0000-000000000002', 39, 43, 'SP', NULL, 860.00),
  ('bbbb0002-0000-0000-0000-000000000002', 44, 48, 'SP', NULL, 1020.00),
  ('bbbb0002-0000-0000-0000-000000000002', 49, 53, 'SP', NULL, 1250.00),
  ('bbbb0002-0000-0000-0000-000000000002', 54, 58, 'SP', NULL, 1530.00),
  ('bbbb0002-0000-0000-0000-000000000002', 59, 999, 'SP', NULL, 1920.00);

-- Bradesco Top Nacional (SP)
INSERT INTO public.precos_por_faixa (plano_id, faixa_etaria_min, faixa_etaria_max, estado, cidade, preco_mensal) VALUES
  ('cccc0001-0000-0000-0000-000000000001', 0, 18, 'SP', NULL, 450.00),
  ('cccc0001-0000-0000-0000-000000000001', 19, 23, 'SP', NULL, 530.00),
  ('cccc0001-0000-0000-0000-000000000001', 24, 28, 'SP', NULL, 620.00),
  ('cccc0001-0000-0000-0000-000000000001', 29, 33, 'SP', NULL, 730.00),
  ('cccc0001-0000-0000-0000-000000000001', 34, 38, 'SP', NULL, 870.00),
  ('cccc0001-0000-0000-0000-000000000001', 39, 43, 'SP', NULL, 1040.00),
  ('cccc0001-0000-0000-0000-000000000001', 44, 48, 'SP', NULL, 1250.00),
  ('cccc0001-0000-0000-0000-000000000001', 49, 53, 'SP', NULL, 1520.00),
  ('cccc0001-0000-0000-0000-000000000001', 54, 58, 'SP', NULL, 1850.00),
  ('cccc0001-0000-0000-0000-000000000001', 59, 999, 'SP', NULL, 2350.00);

-- Bradesco Efetivo (SP)
INSERT INTO public.precos_por_faixa (plano_id, faixa_etaria_min, faixa_etaria_max, estado, cidade, preco_mensal) VALUES
  ('cccc0002-0000-0000-0000-000000000002', 0, 18, 'SP', NULL, 170.00),
  ('cccc0002-0000-0000-0000-000000000002', 19, 23, 'SP', NULL, 200.00),
  ('cccc0002-0000-0000-0000-000000000002', 24, 28, 'SP', NULL, 240.00),
  ('cccc0002-0000-0000-0000-000000000002', 29, 33, 'SP', NULL, 280.00),
  ('cccc0002-0000-0000-0000-000000000002', 34, 38, 'SP', NULL, 330.00),
  ('cccc0002-0000-0000-0000-000000000002', 39, 43, 'SP', NULL, 390.00),
  ('cccc0002-0000-0000-0000-000000000002', 44, 48, 'SP', NULL, 470.00),
  ('cccc0002-0000-0000-0000-000000000002', 49, 53, 'SP', NULL, 580.00),
  ('cccc0002-0000-0000-0000-000000000002', 54, 58, 'SP', NULL, 720.00),
  ('cccc0002-0000-0000-0000-000000000002', 59, 999, 'SP', NULL, 920.00);

-- Hapvida Essencial (CE, PE, BA)
INSERT INTO public.precos_por_faixa (plano_id, faixa_etaria_min, faixa_etaria_max, estado, cidade, preco_mensal) VALUES
  ('dddd0001-0000-0000-0000-000000000001', 0, 18, 'CE', NULL, 120.00),
  ('dddd0001-0000-0000-0000-000000000001', 19, 23, 'CE', NULL, 145.00),
  ('dddd0001-0000-0000-0000-000000000001', 24, 28, 'CE', NULL, 175.00),
  ('dddd0001-0000-0000-0000-000000000001', 29, 33, 'CE', NULL, 210.00),
  ('dddd0001-0000-0000-0000-000000000001', 34, 38, 'CE', NULL, 250.00),
  ('dddd0001-0000-0000-0000-000000000001', 39, 43, 'CE', NULL, 300.00),
  ('dddd0001-0000-0000-0000-000000000001', 44, 48, 'CE', NULL, 370.00),
  ('dddd0001-0000-0000-0000-000000000001', 49, 53, 'CE', NULL, 460.00),
  ('dddd0001-0000-0000-0000-000000000001', 54, 58, 'CE', NULL, 580.00),
  ('dddd0001-0000-0000-0000-000000000001', 59, 999, 'CE', NULL, 750.00);

-- Intermédica Pleno (SP)
INSERT INTO public.precos_por_faixa (plano_id, faixa_etaria_min, faixa_etaria_max, estado, cidade, preco_mensal) VALUES
  ('eeee0001-0000-0000-0000-000000000001', 0, 18, 'SP', NULL, 195.00),
  ('eeee0001-0000-0000-0000-000000000001', 19, 23, 'SP', NULL, 230.00),
  ('eeee0001-0000-0000-0000-000000000001', 24, 28, 'SP', NULL, 270.00),
  ('eeee0001-0000-0000-0000-000000000001', 29, 33, 'SP', NULL, 320.00),
  ('eeee0001-0000-0000-0000-000000000001', 34, 38, 'SP', NULL, 380.00),
  ('eeee0001-0000-0000-0000-000000000001', 39, 43, 'SP', NULL, 450.00),
  ('eeee0001-0000-0000-0000-000000000001', 44, 48, 'SP', NULL, 540.00),
  ('eeee0001-0000-0000-0000-000000000001', 49, 53, 'SP', NULL, 660.00),
  ('eeee0001-0000-0000-0000-000000000001', 54, 58, 'SP', NULL, 810.00),
  ('eeee0001-0000-0000-0000-000000000001', 59, 999, 'SP', NULL, 1030.00);
