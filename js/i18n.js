// Every piece of text the app shows, in English and Brazilian Portuguese.
// Judges read English; farmers in Ceará read Portuguese. Keys are shared, so
// tests/i18n.test.js can check that both languages are complete.

export const LANGS = ['en', 'pt'];

const TEXT = {
  en: {
    'meta.title': 'Entressafra: crop-rotation planner for the fields between harvests',
    'brand.tagline': 'Plan the pause. Protect the soil.',
    'brand.lead': 'What should you plant after the harvest? Compare options for your own field with NASA rainfall data.',
    'brand.example': 'See an example: Cedro, Ceará',
    'brand.exampleHint': 'Opens in seconds with saved NASA data.',
    'brand.notice': 'Prototype for NASA Space Apps 2026 (Field Shift). It shows a climate risk indicator, not a yield forecast. It supports the judgment of farmers and agronomists and never replaces it. The crop table is provisional.',

    'intro.title': 'How it works',
    'intro.s1.title': 'Mark the field',
    'intro.s1.text': 'Pick a point on the map and say what is grown there now.',
    'intro.s2.title': 'Say what matters',
    'intro.s2.text': 'Water, soil, pests, forage, income: you set the weights.',
    'intro.s3.title': 'Compare options',
    'intro.s3.text': 'The current crop against the two best alternatives, each with its reasons and risks.',
    'intro.data': 'Climate data: NASA POWER daily rainfall and temperature for any point on Earth, up to 30 years.',

    'step1.title': '1. Mark the field',
    'step1.hint': 'Click the map, type coordinates, or use your phone location.',
    'step1.lat': 'Latitude',
    'step1.lon': 'Longitude',
    'step1.locate': 'Use my location',
    'step1.mapLabel': 'Map to choose the field location',
    'step1.noMap': 'The map did not load. Type the coordinates below instead.',
    'step1.wheel': 'Click the map first to zoom with the mouse wheel.',

    'step2.title': '2. Crop and rainy season',
    'step2.crop': 'Crop grown now',
    'step2.from': 'Rainy season from',
    'step2.to': 'to',
    'step2.more': 'More settings',
    'step2.years': 'Years of NASA data',
    'step2.hint': 'The season can cross the new year (for example November to March).',

    'step3.title': '3. What matters most?',
    'step3.hint': '0 = ignore, 5 = very important. The ranking updates as you move the sliders.',
    'step3.run': 'Compare rotation strategies',

    'priority.water': 'Water resilience',
    'priority.soil': 'Soil health',
    'priority.rotation': 'Pest-cycle break',
    'priority.forage': 'Forage for animals',
    'priority.income': 'Income (provisional)',
    'priority.water.help': 'Fits the local rainfall risk',
    'priority.soil.help': 'Fixes nitrogen and covers the soil',
    'priority.rotation.help': 'Different plant family from the current crop',
    'priority.forage.help': 'Feeds goats, sheep and cattle',
    'priority.income.help': 'Rough rating; check local prices',

    'status.fetching': 'Fetching daily data from NASA POWER for this point. This can take up to a minute...',
    'status.snapshot': 'Loading saved NASA POWER data for Cedro...',
    'status.done': 'Based on {years} rainy seasons ({from}-{to}) of NASA POWER data.',
    'status.updated': 'Ranking updated.',
    'status.stale': 'You changed the location or the period. Press "Compare rotation strategies" to fetch new NASA data.',
    'status.fallback': 'NASA POWER did not answer ({reason}). Showing the saved NASA POWER data for Cedro instead.',
    'status.error': 'Could not complete the analysis: {reason}',
    'status.errorHint': 'Try again in a minute, or open the Cedro example, which uses saved data.',
    'status.badCoords': 'Please enter valid coordinates.',
    'status.fewYears': 'Not enough complete rainy seasons in the data for this point (found {years}, need at least 3).',
    'status.noCrops': 'Could not load the crop table. Serve this folder over HTTP (see the README).',
    'status.locating': 'Finding your location...',
    'status.noLocation': 'Could not read your location. Click the map instead.',

    'verdict.switch': 'Under your priorities, {best} ranks above keeping {current}.',
    'verdict.keep': 'Under your priorities, keeping {current} ranks first.',
    'verdict.scores': 'Score {best} out of 100, against {current} for the current rotation.',
    'verdict.risk': 'Climate risk at this field: {level}.',
    'verdict.disclaimer': 'A risk indicator, not a yield forecast. Review it with a local agronomist before deciding.',

    'climate.title': 'Your field\'s climate',
    'climate.source.live': 'NASA POWER data fetched live for {lat}, {lon}.',
    'climate.source.snapshot': 'Saved NASA POWER data for {name} ({lat}, {lon}).',
    'climate.more': 'More climate details',
    'tile.rain': 'Rain in the rainy season',
    'tile.rain.unit': '{mm} mm',
    'tile.rain.note': 'average, {from} to {to}',
    'tile.range': 'Best year vs worst year',
    'tile.range.value': '{ratio}×',
    'tile.range.note': '{wet}: {wetMm} mm · {dry}: {dryMm} mm',
    'tile.window': 'Entressafra window',
    'tile.window.note': 'months under 30 mm of rain',
    'tile.window.none': 'none',
    'tile.cv': 'Change from year to year',
    'tile.cv.note': 'coefficient of variation',
    'tile.dry': 'Longest dry spell',
    'tile.dry.unit': '{days} days',
    'tile.dry.note': 'in the season, on average',
    'tile.hot': 'Hot days',
    'tile.hot.note': '35 °C or more in the season',

    'risk.title': 'Climate risk indicator',
    'risk.level.low': 'low',
    'risk.level.moderate': 'moderate',
    'risk.level.high': 'high',
    'risk.score': 'Climate risk: {level} ({score}/100)',
    'risk.part.variability': 'Rain changes from year to year',
    'risk.part.dry': 'Long dry spells',
    'risk.part.low': 'Low season rainfall',
    'risk.explain': 'The indicator is the average of these three parts. Each part runs from 0 to 100 against a provisional reference for the semi-arid (60% variation, 30-day dry spell, 600 mm).',

    'chart.years.title': 'Rain in the rainy season, year by year',
    'chart.years.sub': 'Each column is one season. The line is the average.',
    'chart.years.mean': 'average {mm} mm',
    'chart.years.caption': 'Driest season (red column): {dry}, {dryMm} mm. Wettest: {wet}, {wetMm} mm.',
    'chart.months.title': 'Average rain per month',
    'chart.months.sub': 'Amber months are the chosen rainy season. Under the 30 mm line, fields usually stay idle without irrigation.',
    'chart.months.season': 'Rainy season',
    'chart.months.other': 'Other months',
    'chart.table': 'Show the numbers',
    'chart.col.season': 'Season',
    'chart.col.month': 'Month',
    'chart.col.rain': 'Rain (mm)',
    'chart.col.dry': 'Longest dry spell (days)',
    'chart.col.hot': 'Hot days',

    'results.title': 'Options compared',
    'results.legend': 'The colored bar shows how many of the 100 points each priority adds.',
    'card.current': '#{rank} · Current crop',
    'card.alt': '#{rank} · Alternative',
    'card.keep': 'Keep {crop}',
    'card.switch': 'Switch to {crop}',
    'card.subtitle': '{family} · about {days} days',
    'card.scoreOf': 'out of 100',
    'card.why': 'Why',
    'card.watch': 'Watch out',
    'card.noRisk': 'No specific alert for this crop. See the general notes below.',
    'card.details': 'Details and how the score was computed',
    'card.col.priority': 'Priority',
    'card.col.weight': 'Your weight',
    'card.col.part': 'Crop fit (0-100)',
    'card.col.points': 'Points',
    'card.total': 'Total',
    'card.benefits': 'Possible benefits',
    'card.traits': 'Crop traits (provisional table)',
    'trait.water': 'Water need: {v}',
    'trait.drought': 'Drought tolerance: {v}',
    'trait.cycle': 'Cycle: about {days} days',
    'trait.family': 'Plant family: {family} ({latin})',

    'scale.low': 'low',
    'scale.medium': 'medium',
    'scale.high': 'high',
    'family.Poaceae': 'grass family',
    'family.Fabaceae': 'bean family',
    'family.Euphorbiaceae': 'cassava family',
    'family.Cactaceae': 'cactus family',

    'common.title': 'Applies to every option',
    'common.evidence': 'NASA evidence',
    'common.gaps': 'What this version does not know',
    'common.risks': 'Before deciding',

    'method.title': 'How is the score computed?',
    'method.p1': 'Every crop gets five fit values from 0 to 100, one per priority. Water fit drops for thirsty, drought-sensitive crops when the climate risk is high. Soil fit rewards nitrogen fixing and soil cover. Pest-cycle break is 100 when the plant family differs from the current crop. Forage and income come from the crop table.',
    'method.p2': 'Your slider values are the weights: score = sum(weight × fit) ÷ sum(weights). Nothing is hidden: the details of each option show every number.',
    'method.p3': 'All thresholds and crop traits are provisional and must be validated by local agronomists. Full formulas: docs/methodology.md in the repository.',

    'why.water': 'Water need {need}, drought tolerance {tol}: fits the rain risk here.',
    'why.soil.nfix': 'Fixes nitrogen and covers the soil.',
    'why.soil.cover': 'Gives useful soil cover.',
    'why.rotation': 'Different plant family ({family}): can break pest and disease cycles.',
    'why.forage': 'Good forage for animals.',
    'why.income': 'Income rating {income} (provisional; check local prices).',
    'why.balanced': 'Scores evenly across your priorities.',
    'evidence.climate': 'Over {years} seasons, the rainy season brought {mm} mm on average, changing about {cv}% from one year to the next. The longest dry spell lasted {dry} days on average, with {hot} hot days (35 °C or more). Climate risk: {level}.',
    'benefit.nfix': 'Fixes nitrogen, which can lower fertilizer needs for the next crop.',
    'benefit.cover': 'Good soil cover, which helps reduce erosion.',
    'benefit.forage': 'Useful forage for animals.',
    'benefit.drought': 'Tolerates dry spells better than most options in the table.',
    'benefit.rotation': 'Changes plant family, which can break pest and disease cycles.',
    'benefit.none': 'Few benefits stand out under the chosen priorities.',
    'risk.monoculture': 'Planting the same crop again lets pests and diseases build up.',
    'risk.sameFamily': 'Same plant family as the current crop ({family}): weak pest-cycle break.',
    'risk.water': 'Needs a lot of water and the rain here is not reliable: confirm water availability.',
    'risk.cycle': 'Its cycle (about {cycle} days) is longer than the rainy season (about {season} days): it may need stored soil water or irrigation.',
    'risk.waterFit': 'Water need {need}, drought tolerance {tol}: may suffer in the dry years here.',
    'risk.heat': 'Frequent hot days can stress this crop.',
    'risk.local': 'Check market, labor and seed access with local farmers and agronomists.',
    'gap.soil': 'No local soil data is used yet.',
    'gap.traits': 'Crop traits come from a provisional table that needs validation.',
    'gap.market': 'Market prices and irrigation are not modeled.',

    'footer.data': 'Data: NASA POWER (power.larc.nasa.gov). Map: © OpenStreetMap contributors.',
    'footer.team': 'Team Big Three · IFCE Campus Cedro, Ceará, Brazil · Open source (MIT).',
  },

  pt: {
    'meta.title': 'Entressafra: planejador de rotação de culturas para o período entre safras',
    'brand.tagline': 'Planeje a pausa. Proteja o solo.',
    'brand.lead': 'O que plantar depois da colheita? Compare opções para a sua área com dados de chuva da NASA.',
    'brand.example': 'Ver um exemplo: Cedro, Ceará',
    'brand.exampleHint': 'Abre em segundos com dados da NASA já salvos.',
    'brand.notice': 'Protótipo para o NASA Space Apps 2026 (Field Shift). Mostra um indicador de risco climático, não uma previsão de produtividade. Apoia o julgamento de agricultores e agrônomos e nunca o substitui. A tabela de culturas é provisória.',

    'intro.title': 'Como funciona',
    'intro.s1.title': 'Marque a área',
    'intro.s1.text': 'Escolha um ponto no mapa e diga o que está plantado hoje.',
    'intro.s2.title': 'Diga o que importa',
    'intro.s2.text': 'Água, solo, pragas, forragem, renda: você define os pesos.',
    'intro.s3.title': 'Compare as opções',
    'intro.s3.text': 'A cultura atual contra as duas melhores alternativas, cada uma com motivos e riscos.',
    'intro.data': 'Dados de clima: chuva e temperatura diárias da NASA POWER para qualquer ponto do planeta, até 30 anos.',

    'step1.title': '1. Marque a área',
    'step1.hint': 'Clique no mapa, digite as coordenadas ou use a localização do celular.',
    'step1.lat': 'Latitude',
    'step1.lon': 'Longitude',
    'step1.locate': 'Usar minha localização',
    'step1.mapLabel': 'Mapa para escolher a localização da área',
    'step1.noMap': 'O mapa não carregou. Digite as coordenadas abaixo.',
    'step1.wheel': 'Clique no mapa antes para dar zoom com a rodinha do mouse.',

    'step2.title': '2. Cultura e quadra chuvosa',
    'step2.crop': 'Cultura plantada hoje',
    'step2.from': 'Quadra chuvosa de',
    'step2.to': 'até',
    'step2.more': 'Mais ajustes',
    'step2.years': 'Anos de dados da NASA',
    'step2.hint': 'A estação pode atravessar a virada do ano (por exemplo, novembro a março).',

    'step3.title': '3. O que importa mais?',
    'step3.hint': '0 = ignorar, 5 = muito importante. O ranking se atualiza ao mover os controles.',
    'step3.run': 'Comparar estratégias de rotação',

    'priority.water': 'Resistência à seca',
    'priority.soil': 'Saúde do solo',
    'priority.rotation': 'Quebra do ciclo de pragas',
    'priority.forage': 'Forragem para animais',
    'priority.income': 'Renda (provisório)',
    'priority.water.help': 'Combina com o risco de chuva do local',
    'priority.soil.help': 'Fixa nitrogênio e cobre o solo',
    'priority.rotation.help': 'Família de planta diferente da cultura atual',
    'priority.forage.help': 'Alimenta cabras, ovelhas e gado',
    'priority.income.help': 'Nota aproximada; confira os preços locais',

    'status.fetching': 'Buscando dados diários da NASA POWER para este ponto. Pode levar até um minuto...',
    'status.snapshot': 'Carregando os dados salvos da NASA POWER para Cedro...',
    'status.done': 'Baseado em {years} quadras chuvosas ({from}-{to}) de dados da NASA POWER.',
    'status.updated': 'Ranking atualizado.',
    'status.stale': 'Você mudou o local ou o período. Clique em "Comparar estratégias de rotação" para buscar novos dados da NASA.',
    'status.fallback': 'A NASA POWER não respondeu ({reason}). Mostrando os dados salvos da NASA POWER para Cedro.',
    'status.error': 'Não foi possível concluir a análise: {reason}',
    'status.errorHint': 'Tente de novo em um minuto ou abra o exemplo de Cedro, que usa dados salvos.',
    'status.badCoords': 'Digite coordenadas válidas.',
    'status.fewYears': 'Não há quadras chuvosas completas suficientes para este ponto (encontradas {years}, mínimo 3).',
    'status.noCrops': 'Não foi possível carregar a tabela de culturas. Abra esta pasta por um servidor HTTP (veja o README).',
    'status.locating': 'Buscando sua localização...',
    'status.noLocation': 'Não foi possível ler sua localização. Clique no mapa.',

    'verdict.switch': 'Com as suas prioridades, {best} fica à frente de manter {current}.',
    'verdict.keep': 'Com as suas prioridades, manter {current} fica em primeiro lugar.',
    'verdict.scores': 'Nota {best} de 100, contra {current} da cultura atual.',
    'verdict.risk': 'Risco climático nesta área: {level}.',
    'verdict.disclaimer': 'Indicador de risco, não previsão de produtividade. Revise com um agrônomo local antes de decidir.',

    'climate.title': 'O clima da sua área',
    'climate.source.live': 'Dados da NASA POWER consultados agora para {lat}, {lon}.',
    'climate.source.snapshot': 'Dados salvos da NASA POWER para {name} ({lat}, {lon}).',
    'climate.more': 'Mais detalhes do clima',
    'tile.rain': 'Chuva na quadra chuvosa',
    'tile.rain.unit': '{mm} mm',
    'tile.rain.note': 'média, de {from} a {to}',
    'tile.range': 'Melhor ano × pior ano',
    'tile.range.value': '{ratio}×',
    'tile.range.note': '{wet}: {wetMm} mm · {dry}: {dryMm} mm',
    'tile.window': 'Janela de entressafra',
    'tile.window.note': 'meses com menos de 30 mm de chuva',
    'tile.window.none': 'nenhuma',
    'tile.cv': 'Variação de um ano para outro',
    'tile.cv.note': 'coeficiente de variação',
    'tile.dry': 'Maior veranico',
    'tile.dry.unit': '{days} dias',
    'tile.dry.note': 'na estação, em média',
    'tile.hot': 'Dias quentes',
    'tile.hot.note': '35 °C ou mais na estação',

    'risk.title': 'Indicador de risco climático',
    'risk.level.low': 'baixo',
    'risk.level.moderate': 'moderado',
    'risk.level.high': 'alto',
    'risk.score': 'Risco climático: {level} ({score}/100)',
    'risk.part.variability': 'Chuva muda muito de ano para ano',
    'risk.part.dry': 'Veranicos longos',
    'risk.part.low': 'Pouca chuva na estação',
    'risk.explain': 'O indicador é a média destas três partes. Cada parte vai de 0 a 100, comparada a uma referência provisória para o semiárido (60% de variação, veranico de 30 dias, 600 mm).',

    'chart.years.title': 'Chuva na quadra chuvosa, ano a ano',
    'chart.years.sub': 'Cada coluna é uma estação. A linha é a média.',
    'chart.years.mean': 'média {mm} mm',
    'chart.years.caption': 'Estação mais seca (coluna vermelha): {dry}, {dryMm} mm. Mais chuvosa: {wet}, {wetMm} mm.',
    'chart.months.title': 'Chuva média por mês',
    'chart.months.sub': 'Os meses em âmbar são a quadra chuvosa escolhida. Abaixo da linha de 30 mm, a área costuma ficar parada sem irrigação.',
    'chart.months.season': 'Quadra chuvosa',
    'chart.months.other': 'Outros meses',
    'chart.table': 'Ver os números',
    'chart.col.season': 'Estação',
    'chart.col.month': 'Mês',
    'chart.col.rain': 'Chuva (mm)',
    'chart.col.dry': 'Maior veranico (dias)',
    'chart.col.hot': 'Dias quentes',

    'results.title': 'Opções comparadas',
    'results.legend': 'A barra colorida mostra quantos dos 100 pontos cada prioridade soma.',
    'card.current': '#{rank} · Cultura atual',
    'card.alt': '#{rank} · Alternativa',
    'card.keep': 'Manter {crop}',
    'card.switch': 'Trocar para {crop}',
    'card.subtitle': '{family} · ciclo de cerca de {days} dias',
    'card.scoreOf': 'de 100',
    'card.why': 'Por quê',
    'card.watch': 'Atenção',
    'card.noRisk': 'Nenhum alerta específico para esta cultura. Veja as observações gerais abaixo.',
    'card.details': 'Detalhes e como a nota foi calculada',
    'card.col.priority': 'Prioridade',
    'card.col.weight': 'Seu peso',
    'card.col.part': 'Adequação (0-100)',
    'card.col.points': 'Pontos',
    'card.total': 'Total',
    'card.benefits': 'Possíveis benefícios',
    'card.traits': 'Características (tabela provisória)',
    'trait.water': 'Necessidade de água: {v}',
    'trait.drought': 'Tolerância à seca: {v}',
    'trait.cycle': 'Ciclo: cerca de {days} dias',
    'trait.family': 'Família: {family} ({latin})',

    'scale.low': 'baixa',
    'scale.medium': 'média',
    'scale.high': 'alta',
    'family.Poaceae': 'família das gramíneas',
    'family.Fabaceae': 'família do feijão',
    'family.Euphorbiaceae': 'família da mandioca',
    'family.Cactaceae': 'família dos cactos',

    'common.title': 'Vale para todas as opções',
    'common.evidence': 'Evidência da NASA',
    'common.gaps': 'O que esta versão ainda não sabe',
    'common.risks': 'Antes de decidir',

    'method.title': 'Como a nota é calculada?',
    'method.p1': 'Cada cultura recebe cinco valores de adequação de 0 a 100, um por prioridade. A adequação hídrica cai para culturas exigentes em água e sensíveis à seca quando o risco climático é alto. A saúde do solo valoriza fixação de nitrogênio e cobertura do solo. A quebra do ciclo de pragas vale 100 quando a família da planta é diferente da cultura atual. Forragem e renda vêm da tabela de culturas.',
    'method.p2': 'Os valores dos controles são os pesos: nota = soma(peso × adequação) ÷ soma(pesos). Nada fica escondido: os detalhes de cada opção mostram todos os números.',
    'method.p3': 'Todos os limites e características das culturas são provisórios e precisam ser validados por agrônomos locais. Fórmulas completas: docs/methodology.md no repositório.',

    'why.water': 'Necessidade de água {need}, tolerância à seca {tol}: combina com o risco de chuva daqui.',
    'why.soil.nfix': 'Fixa nitrogênio e cobre o solo.',
    'why.soil.cover': 'Oferece boa cobertura do solo.',
    'why.rotation': 'Outra família de plantas ({family}): pode quebrar ciclos de pragas e doenças.',
    'why.forage': 'Boa forragem para os animais.',
    'why.income': 'Nota de renda {income} (provisória; confira os preços locais).',
    'why.balanced': 'Tem notas equilibradas entre as suas prioridades.',
    'evidence.climate': 'Em {years} estações, a quadra chuvosa trouxe em média {mm} mm, variando cerca de {cv}% de um ano para outro. O maior veranico durou em média {dry} dias, com {hot} dias quentes (35 °C ou mais). Risco climático: {level}.',
    'benefit.nfix': 'Fixa nitrogênio, o que pode reduzir a adubação da próxima cultura.',
    'benefit.cover': 'Boa cobertura do solo, que ajuda a reduzir a erosão.',
    'benefit.forage': 'Boa forragem para os animais.',
    'benefit.drought': 'Aguenta veranicos melhor que a maioria das opções da tabela.',
    'benefit.rotation': 'Muda a família de plantas, o que pode quebrar ciclos de pragas e doenças.',
    'benefit.none': 'Poucos benefícios se destacam com as prioridades escolhidas.',
    'risk.monoculture': 'Plantar a mesma cultura de novo acumula pragas e doenças.',
    'risk.sameFamily': 'Mesma família de plantas da cultura atual ({family}): quebra fraca do ciclo de pragas.',
    'risk.water': 'Precisa de muita água e a chuva daqui não é garantida: confirme a disponibilidade de água.',
    'risk.cycle': 'O ciclo (cerca de {cycle} dias) é maior que a quadra chuvosa (cerca de {season} dias): pode depender de água guardada no solo ou de irrigação.',
    'risk.waterFit': 'Necessidade de água {need}, tolerância à seca {tol}: pode sofrer nos anos secos daqui.',
    'risk.heat': 'Dias muito quentes e frequentes podem estressar esta cultura.',
    'risk.local': 'Confira mercado, mão de obra e acesso a sementes com agricultores e agrônomos locais.',
    'gap.soil': 'Ainda não usa dados de solo locais.',
    'gap.traits': 'As características das culturas vêm de uma tabela provisória que precisa ser validada.',
    'gap.market': 'Preços de mercado e irrigação não são considerados.',

    'footer.data': 'Dados: NASA POWER (power.larc.nasa.gov). Mapa: © colaboradores do OpenStreetMap.',
    'footer.team': 'Equipe Big Three · IFCE Campus Cedro, Ceará, Brasil · Código aberto (MIT).',
  },
};

export const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
};

let current = 'en';

export function setLang(lang) {
  current = LANGS.includes(lang) ? lang : 'en';
  return current;
}

export function getLang() {
  return current;
}

/** Translates a key, filling {placeholders} from params. Unknown keys show as-is, so gaps are visible. */
export function t(key, params = {}) {
  const template = TEXT[current][key] ?? TEXT.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => (name in params ? String(params[name]) : `{${name}}`));
}

/** A 1-5 rating from the crop table, in words: low, medium or high. */
export function scaleWord(rating) {
  return t(rating <= 2 ? 'scale.low' : rating === 3 ? 'scale.medium' : 'scale.high');
}

/** "Fabaceae" -> "bean family" (falls back to the Latin name). */
export function familyName(latin) {
  const key = `family.${latin}`;
  return t(key) === key ? latin : t(key);
}

/** Translates a { key, params } message from js/scoring.js, turning raw values into words. */
export function tm(message) {
  const p = { ...message.params };
  if (p.level) p.level = t(`risk.level.${p.level}`);
  if (p.family) p.family = familyName(p.family);
  for (const k of ['need', 'tol', 'income']) if (k in p) p[k] = scaleWord(p[k]);
  return t(message.key, p);
}

export function monthName(m) {
  return MONTHS[current][m - 1];
}

export function cropName(crop) {
  return current === 'pt' ? crop.name_pt : crop.name_en;
}

/** For tests: every key of a language. */
export function keysOf(lang) {
  return Object.keys(TEXT[lang]);
}
