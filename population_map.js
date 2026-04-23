// ══════════════════════════════════════════════════
// REAL DATA — 令和2年国勢調査 / 令和4年就業構造基本調査
// ══════════════════════════════════════════════════

const TOTAL = 126146000; // 令和2年 総人口

// ── 性別比率（令和2年国勢調査）
const SEX_R = { male: 0.4864, female: 0.5136 };

// ── 年齢別人口累積分布（令和2年国勢調査 5歳階級別）
const AGE_POPS = [4641,5128,5395,5630,5987,6261,6870,7400,8308,9466,8450,7420,7027,7688,7941,6222,4899,3250,1726,620,180];
const AGE_BRACKETS = [[0,4],[5,9],[10,14],[15,19],[20,24],[25,29],[30,34],[35,39],[40,44],[45,49],[50,54],[55,59],[60,64],[65,69],[70,74],[75,79],[80,84],[85,89],[90,94],[95,99],[100,100]];
const AGE_TOTAL = AGE_POPS.reduce((s,v)=>s+v,0);
const AGE_CUM = (() => {
  const d=[]; let c=0;
  AGE_BRACKETS.forEach(([lo,hi],i)=>{
    const pa=AGE_POPS[i]/(hi-lo+1);
    for(let a=lo;a<=hi;a++){c+=pa;d[a]=c/AGE_TOTAL;}
  });
  return d;
})();
function ageRatio(lo,hi){return Math.max(0,(AGE_CUM[Math.min(hi,100)])-(lo>0?AGE_CUM[lo-1]:0));}

// ── 配偶関係別人口比率（令和2年国勢調査 15歳以上人口）
const MARITAL_OF_15PLUS = { single:0.275, married:0.570, bereaved:0.085, divorced:0.066 };
const RATIO_15PLUS = 0.858;

// ── 学歴別比率（令和2年国勢調査 就業状態等基本集計 15歳以上）
const EDU_R = { all:1, elementary:0.182, highschool:0.385, college:0.146, university:0.263 };

// ── 職業大分類別 就業者数と全国比率（令和2年国勢調査 就業状態等基本集計）
const OCC_DATA = {
  mgr: { name:'管理的職業',     pop:  1288000, r:0.0197 },
  pro: { name:'専門的・技術的', pop: 12204000, r:0.1864 },
  clk: { name:'事務',           pop: 13731000, r:0.2097 },
  sal: { name:'販売',           pop:  8077000, r:0.1233 },
  svc: { name:'サービス',       pop:  8395000, r:0.1282 },
  sec: { name:'保安',           pop:  1043000, r:0.0159 },
  agr: { name:'農林漁業',       pop:  2016000, r:0.0308 },
  mfg: { name:'生産工程',       pop:  8421000, r:0.1286 },
  trn: { name:'輸送・機械運転', pop:  2202000, r:0.0336 },
  cns: { name:'建設・採掘',     pop:  2879000, r:0.0440 },
  cln: { name:'運搬・清掃等',   pop:  4011000, r:0.0613 },
};
const OCC_TOTAL_EMPLOYED = 65468000;
const EMPLOYMENT_RATE = OCC_TOTAL_EMPLOYED / TOTAL;

// ── 年収別比率（令和4年就業構造基本調査 表04000 有業者ベース）
const INCOME_BRACKETS = [
  { min: 0, max: 50, r: 0.076 },
  { min: 50, max: 100, r: 0.083 },
  { min: 100, max: 200, r: 0.156 },
  { min: 200, max: 300, r: 0.137 },
  { min: 300, max: 400, r: 0.129 },
  { min: 400, max: 500, r: 0.105 },
  { min: 500, max: 700, r: 0.144 },
  { min: 700, max: 1000, r: 0.093 },
  { min: 1000, max: 99999, r: 0.077 }
];

function incomeRatio(minV, maxV) {
  let r = 0;
  INCOME_BRACKETS.forEach(b => {
    const overlapMin = Math.max(minV, b.min);
    const overlapMax = Math.min(maxV === 1000 ? 99999 : maxV, b.max);
    if (overlapMin < overlapMax) {
      r += b.r * ((overlapMax - overlapMin) / (b.max - b.min));
    }
  });
  return r;
}

// ── 都道府県別人口（令和2年国勢調査）+ 職業別就業者構成比（都道府県別）
const PREFS = [
  {n:'北海道',pop:5224614,x:383.9,y:89.2,  occ:{mgr:0.90,pro:0.98,clk:0.92,sal:0.96,svc:1.05,sec:1.02,agr:1.55,mfg:0.72,trn:1.08,cns:1.12,cln:1.03}},
  {n:'青森',  pop:1237984,x:358,y:150, occ:{mgr:0.80,pro:0.94,clk:0.85,sal:0.90,svc:1.02,sec:1.00,agr:2.10,mfg:0.78,trn:1.05,cns:1.10,cln:1.00}},
  {n:'岩手',  pop:1210534,x:380.5,y:168.3, occ:{mgr:0.80,pro:0.93,clk:0.84,sal:0.88,svc:1.00,sec:0.98,agr:2.00,mfg:0.92,trn:1.04,cns:1.12,cln:0.98}},
  {n:'宮城',  pop:2301996,x:375,y:190.9, occ:{mgr:0.95,pro:1.00,clk:0.98,sal:0.98,svc:1.02,sec:1.02,agr:1.20,mfg:0.88,trn:1.02,cns:1.08,cln:1.00}},
  {n:'秋田',  pop: 959502,x:350.4,y:170.3, occ:{mgr:0.80,pro:0.92,clk:0.83,sal:0.86,svc:1.00,sec:0.98,agr:2.20,mfg:0.85,trn:1.05,cns:1.10,cln:0.98}},
  {n:'山形',  pop:1067596,x:348.1,y:192.7, occ:{mgr:0.82,pro:0.92,clk:0.84,sal:0.87,svc:0.98,sec:0.97,agr:2.00,mfg:1.05,trn:1.04,cns:1.10,cln:0.97}},
  {n:'福島',  pop:1833152,x:366.5,y:212.9, occ:{mgr:0.85,pro:0.94,clk:0.86,sal:0.90,svc:0.99,sec:0.99,agr:1.60,mfg:1.10,trn:1.05,cns:1.10,cln:0.99}},
  {n:'茨城',  pop:2867009,x:366.3,y:232.9, occ:{mgr:0.88,pro:0.98,clk:0.90,sal:0.92,svc:0.97,sec:1.00,agr:1.40,mfg:1.20,trn:1.05,cns:1.05,cln:1.00}},
  {n:'栃木',  pop:1933146,x:347.3,y:215.4, occ:{mgr:0.88,pro:0.96,clk:0.88,sal:0.91,svc:0.97,sec:0.99,agr:1.35,mfg:1.22,trn:1.04,cns:1.06,cln:0.99}},
  {n:'群馬',  pop:1939110,x:327.1,y:229.1, occ:{mgr:0.88,pro:0.95,clk:0.88,sal:0.92,svc:0.97,sec:0.99,agr:1.30,mfg:1.25,trn:1.04,cns:1.05,cln:0.99}},
  {n:'埼玉',  pop:7344765,x:344.4,y:239.7, occ:{mgr:1.00,pro:1.02,clk:1.08,sal:1.02,svc:0.98,sec:1.00,agr:0.60,mfg:0.98,trn:1.02,cns:0.98,cln:1.00}},
  {n:'千葉',  pop:6284480,x:375.1,y:259.3, occ:{mgr:1.02,pro:1.05,clk:1.08,sal:1.02,svc:0.99,sec:1.00,agr:0.80,mfg:0.88,trn:1.05,cns:0.95,cln:1.00}},
  {n:'東京',  pop:13960000,x:354,y:262.5,occ:{mgr:1.50,pro:1.35,clk:1.29,sal:1.10,svc:1.05,sec:1.08,agr:0.10,mfg:0.55,trn:0.95,cns:0.80,cln:0.95}},
  {n:'神奈川',pop:9237337,x:337.7,y:273.6, occ:{mgr:1.10,pro:1.15,clk:1.10,sal:1.05,svc:1.02,sec:1.05,agr:0.25,mfg:0.92,trn:1.00,cns:0.88,cln:0.98}},
  {n:'新潟',  pop:2201272,x:327,y:211.1, occ:{mgr:0.85,pro:0.94,clk:0.87,sal:0.90,svc:0.98,sec:0.98,agr:1.70,mfg:1.05,trn:1.04,cns:1.08,cln:0.98}},
  {n:'富山',  pop:1034814,x:307,y:229.9, occ:{mgr:0.88,pro:0.96,clk:0.90,sal:0.91,svc:0.96,sec:0.97,agr:1.20,mfg:1.28,trn:1.04,cns:1.06,cln:0.98}},
  {n:'石川',  pop:1132526,x:291.5,y:220.2, occ:{mgr:0.90,pro:0.98,clk:0.92,sal:0.93,svc:1.00,sec:0.98,agr:1.10,mfg:1.18,trn:1.03,cns:1.06,cln:0.99}},
  {n:'福井',  pop: 766863,x:276,y:240.3, occ:{mgr:0.88,pro:0.96,clk:0.90,sal:0.91,svc:0.97,sec:0.97,agr:1.15,mfg:1.25,trn:1.03,cns:1.05,cln:0.98}},
  {n:'山梨',  pop: 809974,x:325.3,y:249.2, occ:{mgr:0.85,pro:0.95,clk:0.88,sal:0.91,svc:0.98,sec:0.99,agr:1.40,mfg:1.15,trn:1.03,cns:1.06,cln:0.99}},
  {n:'長野',  pop:2048011,x:309.8,y:244.7, occ:{mgr:0.87,pro:0.97,clk:0.88,sal:0.91,svc:1.00,sec:0.98,agr:1.55,mfg:1.10,trn:1.03,cns:1.08,cln:0.99}},
  {n:'岐阜',  pop:1978742,x:288.5,y:246.4, occ:{mgr:0.88,pro:0.95,clk:0.89,sal:0.92,svc:0.97,sec:0.98,agr:1.10,mfg:1.28,trn:1.03,cns:1.06,cln:0.99}},
  {n:'静岡',  pop:3633202,x:318.6,y:275.7, occ:{mgr:0.90,pro:0.98,clk:0.92,sal:0.94,svc:0.98,sec:0.99,agr:1.10,mfg:1.30,trn:1.04,cns:1.00,cln:1.00}},
  {n:'愛知',  pop:7542415,x:299.9,y:268.1, occ:{mgr:0.98,pro:1.05,clk:0.96,sal:0.98,svc:0.97,sec:1.00,agr:0.70,mfg:1.45,trn:1.05,cns:0.95,cln:1.00}},
  {n:'三重',  pop:1770254,x:290.6,y:285.2, occ:{mgr:0.88,pro:0.95,clk:0.90,sal:0.92,svc:0.98,sec:0.98,agr:1.25,mfg:1.22,trn:1.03,cns:1.02,cln:0.99}},
  {n:'滋賀',  pop:1413610,x:274,y:260.6, occ:{mgr:0.92,pro:1.00,clk:0.94,sal:0.95,svc:0.96,sec:0.98,agr:0.90,mfg:1.32,trn:1.03,cns:0.98,cln:1.00}},
  {n:'京都',  pop:2578087,x:262.7,y:250, occ:{mgr:1.00,pro:1.12,clk:0.98,sal:0.98,svc:1.05,sec:1.00,agr:0.70,mfg:1.00,trn:1.00,cns:0.92,cln:0.98}},
  {n:'大阪',  pop:8837685,x:258.5,y:275.5, occ:{mgr:1.10,pro:1.08,clk:1.05,sal:1.10,svc:1.08,sec:1.02,agr:0.20,mfg:0.90,trn:1.02,cns:0.90,cln:1.05}},
  {n:'兵庫',  pop:5465002,x:243.9,y:254, occ:{mgr:1.00,pro:1.05,clk:1.00,sal:1.00,svc:1.02,sec:1.00,agr:0.70,mfg:1.05,trn:1.02,cns:0.95,cln:1.00}},
  {n:'奈良',  pop:1324473,x:276.3,y:276.9, occ:{mgr:0.95,pro:1.02,clk:0.98,sal:0.95,svc:0.98,sec:0.98,agr:0.80,mfg:0.98,trn:1.00,cns:0.95,cln:0.99}},
  {n:'和歌山',pop: 922584,x:267,y:296.7, occ:{mgr:0.85,pro:0.93,clk:0.88,sal:0.92,svc:1.00,sec:0.98,agr:1.60,mfg:0.95,trn:1.03,cns:1.05,cln:1.00}},
  {n:'鳥取',  pop: 553407,x:231,y:247, occ:{mgr:0.82,pro:0.95,clk:0.86,sal:0.88,svc:0.99,sec:0.98,agr:1.80,mfg:0.88,trn:1.03,cns:1.08,cln:0.98}},
  {n:'島根',  pop: 671126,x:206.5,y:252.6, occ:{mgr:0.82,pro:0.95,clk:0.86,sal:0.88,svc:1.00,sec:0.98,agr:1.90,mfg:0.88,trn:1.02,cns:1.10,cln:0.98}},
  {n:'岡山',  pop:1888432,x:231.3,y:263.9, occ:{mgr:0.90,pro:0.98,clk:0.92,sal:0.94,svc:1.00,sec:0.99,agr:1.30,mfg:1.08,trn:1.03,cns:1.04,cln:1.00}},
  {n:'広島',  pop:2799702,x:211,y:272.8, occ:{mgr:0.98,pro:1.02,clk:0.98,sal:0.98,svc:1.00,sec:1.00,agr:0.90,mfg:1.12,trn:1.02,cns:1.00,cln:1.00}},
  {n:'山口',  pop:1342059,x:189.6,y:274, occ:{mgr:0.88,pro:0.96,clk:0.90,sal:0.92,svc:1.00,sec:1.00,agr:1.20,mfg:1.15,trn:1.04,cns:1.05,cln:1.00}},
  {n:'徳島',  pop: 719559,x:245.6,y:297.2, occ:{mgr:0.85,pro:0.96,clk:0.88,sal:0.90,svc:1.00,sec:0.98,agr:1.55,mfg:0.98,trn:1.03,cns:1.05,cln:0.99}},
  {n:'香川',  pop: 950244,x:236.1,y:283.6, occ:{mgr:0.90,pro:0.98,clk:0.92,sal:0.94,svc:1.00,sec:0.99,agr:1.30,mfg:1.05,trn:1.03,cns:1.04,cln:0.99}},
  {n:'愛媛',  pop:1334841,x:202.5,y:295, occ:{mgr:0.88,pro:0.96,clk:0.90,sal:0.92,svc:1.00,sec:0.99,agr:1.40,mfg:1.05,trn:1.04,cns:1.05,cln:0.99}},
  {n:'高知',  pop: 691527,x:222.6,y:303.1, occ:{mgr:0.82,pro:0.96,clk:0.86,sal:0.88,svc:1.02,sec:0.99,agr:1.60,mfg:0.82,trn:1.03,cns:1.08,cln:0.99}},
  {n:'福岡',  pop:5135214,x:174.9,y:293.1, occ:{mgr:1.00,pro:1.05,clk:1.02,sal:1.05,svc:1.08,sec:1.02,agr:0.70,mfg:0.82,trn:1.05,cns:1.00,cln:1.05}},
  {n:'佐賀',  pop: 811442,x:154.2,y:286.6, occ:{mgr:0.83,pro:0.93,clk:0.87,sal:0.90,svc:1.00,sec:0.98,agr:1.55,mfg:1.02,trn:1.03,cns:1.06,cln:0.99}},
  {n:'長崎',  pop:1312317,x:145.7,y:305.7, occ:{mgr:0.83,pro:0.96,clk:0.88,sal:0.90,svc:1.03,sec:1.00,agr:1.30,mfg:0.90,trn:1.05,cns:1.08,cln:1.00}},
  {n:'熊本',  pop:1738496,x:166.3,y:317.1, occ:{mgr:0.85,pro:0.97,clk:0.90,sal:0.93,svc:1.02,sec:0.99,agr:1.55,mfg:0.92,trn:1.04,cns:1.05,cln:1.00}},
  {n:'大分',  pop:1123852,x:193.2,y:309.6, occ:{mgr:0.85,pro:0.96,clk:0.88,sal:0.91,svc:1.02,sec:0.99,agr:1.40,mfg:0.98,trn:1.04,cns:1.06,cln:1.00}},
  {n:'宮崎',  pop:1069576,x:186,y:329.1, occ:{mgr:0.82,pro:0.95,clk:0.86,sal:0.90,svc:1.02,sec:0.99,agr:1.80,mfg:0.85,trn:1.04,cns:1.06,cln:1.00}},
  {n:'鹿児島',pop:1588256,x:167.7,y:338.8, occ:{mgr:0.82,pro:0.96,clk:0.87,sal:0.90,svc:1.03,sec:1.00,agr:1.70,mfg:0.80,trn:1.04,cns:1.06,cln:1.00}},
  {n:'沖縄',  pop:1467480,x:141.1,y:366.3, occ:{mgr:0.85,pro:0.98,clk:0.92,sal:0.98,svc:1.18,sec:1.08,agr:0.90,mfg:0.65,trn:1.06,cns:1.12,cln:1.05}},
];

// ── ラベルマップ
const MAR_L = { single: '未婚', married: '有配偶', bereaved: '死別', divorced: '離別' };
const OCC_L = {};
Object.entries(OCC_DATA).forEach(([k, v]) => OCC_L[k] = v.name);
const INC_L = {
    u50: '〜50万円未満', u100: '50〜100万円', u200: '100〜200万円',
    u300: '200〜300万円', u400: '300〜400万円', u500: '400〜500万円',
    u700: '500〜700万円', u1000: '700〜1000万円', o1000: '1000万円以上'
};
const EDU_L = { highschool: '高卒以上', college: '短大高専専門卒以上', university: '大学卒以上' };

// ══════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════
let editMode = false;
const S = {
    sex: 'all', ageMin: 20, ageMax: 60,
    marital: new Set(['single']),
    edu: 'all',
    occ: new Set(),
    incomeMin: 0, incomeMax: 1000
};

// ══════════════════════════════════════════════════
// COMPUTE
// ══════════════════════════════════════════════════

function globalRatio() {
    let r = 1;

    // 性別
    if (S.sex !== 'all') r *= SEX_R[S.sex];

    // 年齢
    r *= ageRatio(S.ageMin, S.ageMax);

    // 配偶関係 (既婚者は常に除外される)
    const activeMarital = S.marital.size > 0 ? [...S.marital] : ['single', 'bereaved', 'divorced'];
    const marR = activeMarital.reduce((s, k) => s + (MARITAL_OF_15PLUS[k] || 0), 0);
    const has_single = activeMarital.includes('single');
    const under15_ratio = 1 - RATIO_15PLUS;
    r *= marR * RATIO_15PLUS + (has_single ? under15_ratio : 0);

    // 学歴（15歳以上）
    if (S.edu !== 'all') r *= EDU_R[S.edu];

    // 職業（就業者に対する比率、複数OR）
    if (S.occ.size > 0) {
        const occR = [...S.occ].reduce((s, k) => s + (OCC_DATA[k].r || 0), 0);
        r *= EMPLOYMENT_RATE * occR;
    }

    // 年収（有業者ベース。就業者 ≈ 有業者として近似）
    if (S.incomeMin > 0 || S.incomeMax < 1000) {
        const incR = incomeRatio(S.incomeMin, S.incomeMax);
        if (S.occ.size === 0) {
            r *= EMPLOYMENT_RATE * incR;
        } else {
            r *= incR;
        }
    }

    return Math.min(Math.max(r, 0), 1);
}

// 都道府県ごとの推計人口
function computePerPref() {
    const occSelected = S.occ.size > 0;
    const incSelected = S.incomeMin > 0 || S.incomeMax < 1000;

    return PREFS.map(p => {
        let pop = p.pop;

        // 性別
        if (S.sex !== 'all') pop *= SEX_R[S.sex];

        // 年齢
        pop *= ageRatio(S.ageMin, S.ageMax);

        // 配偶関係 (既婚者は常に除外される)
        const activeMarital = S.marital.size > 0 ? [...S.marital] : ['single', 'bereaved', 'divorced'];
        const marR = activeMarital.reduce((s, k) => s + (MARITAL_OF_15PLUS[k] || 0), 0);
        const has_single = activeMarital.includes('single');
        const under15_ratio = 1 - RATIO_15PLUS;
        pop *= marR * RATIO_15PLUS + (has_single ? under15_ratio : 0);

        // 学歴
        if (S.edu !== 'all') pop *= EDU_R[S.edu];

        // 職業（都道府県別構成比を使用）
        if (occSelected) {
            const prefEmpPop = p.pop * EMPLOYMENT_RATE;
            let occPop = 0;
            S.occ.forEach(k => {
                const nationalShare = OCC_DATA[k].r;
                const deviance = p.occ[k] || 1.0;
                occPop += prefEmpPop * nationalShare * deviance;
            });
            pop = occPop;
            
            // 他フィルターの比率を乗算
            if (S.sex !== 'all') pop *= SEX_R[S.sex];
            if (S.ageMin > 0 || S.ageMax < 100) pop *= ageRatio(S.ageMin, S.ageMax);
            // 配偶関係 (既婚者は常に除外される)
            const activeMarital = S.marital.size > 0 ? [...S.marital] : ['single', 'bereaved', 'divorced'];
            const marR = activeMarital.reduce((s, k) => s + (MARITAL_OF_15PLUS[k] || 0), 0);
            const has_single = activeMarital.includes('single');
            pop *= marR * RATIO_15PLUS + (has_single ? (1 - RATIO_15PLUS) : 0);
            if (S.edu !== 'all') pop *= EDU_R[S.edu];
        }

        // 年収
        if (incSelected) {
            if (!occSelected) pop *= EMPLOYMENT_RATE;
            pop *= incomeRatio(S.incomeMin, S.incomeMax);
        }

        return { ...p, filtered: Math.max(0, Math.round(pop)) };
    });
}


function filterItems() {
    const it = [];
    if (S.sex !== 'all') it.push({ k: '性別', v: S.sex === 'male' ? '男性' : '女性' });
    if (S.ageMin > 20 || S.ageMax < 100) it.push({ k: '年齢', v: `${S.ageMin}〜${S.ageMax}歳` });
    if (S.marital.size > 0) it.push({ k: '配偶関係', v: [...S.marital].map(k => MAR_L[k]).join('・') });
    if (S.edu !== 'all') it.push({ k: '学歴', v: EDU_L[S.edu] });
    if (S.occ.size > 0) it.push({ k: '職業', v: [...S.occ].map(k => OCC_L[k]).join('・') });
    if (S.incomeMin > 0 || S.incomeMax < 1000) {
        const midLbl = `${S.incomeMin}〜${S.incomeMax}万円` + (S.incomeMax === 1000 ? '以上' : '');
        it.push({ k: '年収', v: midLbl });
    }
    return it;
}

// ══════════════════════════════════════════════════
// MAP
// ══════════════════════════════════════════════════
function buildMap() {
    const g = document.getElementById('land-layer');
    const shapes = [
        'M375.8,132.6 L362.5,132.6 L361.6,138.0 L368.7,140.6 L367.8,147.8 L362.5,143.3 L358.0,148.7 L353.5,136.2 L348.2,139.8 L348.2,146.0 L341.1,154.0 L345.5,163.8 L344.6,185.2 L336.6,202.1 L309.9,227.0 L303.7,229.7 L296.5,225.2 L301.9,211.9 L294.8,210.1 L285.9,215.5 L285.0,226.1 L273.4,232.4 L270.7,248.4 L215.5,244.0 L202.1,254.6 L179.0,263.5 L176.3,273.3 L197.7,284.0 L204.8,273.3 L214.6,276.9 L239.5,268.0 L259.1,270.7 L263.6,274.2 L258.2,288.5 L270.7,300.1 L285.9,288.5 L295.7,286.7 L288.5,277.8 L293.0,269.8 L301.0,277.8 L320.6,280.5 L329.5,271.6 L334.0,282.2 L356.2,257.3 L357.1,263.5 L350.9,271.6 L355.3,274.2 L374.0,258.2 L366.9,245.7 L374.0,225.2 L369.6,204.8 L372.2,202.1 L379.4,205.7 L383.8,194.1 L381.2,186.1 L386.5,162.0 L374.9,146.9 Z',
        'M438.2,64.9 L433.7,64.0 L417.7,75.6 L407.9,66.7 L390.1,58.7 L374.9,42.7 L368.7,40.0 L366.0,45.3 L362.5,66.7 L363.3,73.0 L358.9,87.2 L356.2,88.1 L344.6,83.6 L342.0,89.9 L344.6,98.8 L333.1,105.0 L333.1,108.6 L342.0,120.2 L339.3,126.4 L340.2,130.0 L348.2,130.0 L353.5,122.8 L365.1,124.6 L366.9,121.0 L366.0,116.6 L353.5,115.7 L350.0,112.1 L351.8,105.0 L358.9,105.0 L362.5,109.5 L374.0,105.0 L404.3,121.9 L415.0,103.2 L435.5,98.8 L442.6,94.3 L435.5,83.6 Z',
        'M172.8,276.9 L166.5,278.7 L164.7,280.5 L156.7,282.2 L146.0,287.6 L145.1,298.3 L146.0,301.8 L148.7,304.5 L150.5,303.6 L155.8,305.4 L161.2,304.5 L159.4,301.8 L160.3,296.5 L163.0,296.5 L165.6,299.2 L167.4,304.5 L164.7,307.2 L164.7,309.9 L167.4,310.8 L168.3,312.5 L158.5,323.2 L159.4,325.0 L158.5,333.9 L167.4,335.7 L167.4,328.6 L171.9,327.7 L174.5,329.5 L174.5,332.1 L171.9,336.6 L169.2,338.4 L169.2,341.0 L177.2,341.9 L181.7,337.5 L187.0,335.7 L190.6,331.2 L189.7,317.9 L195.9,309.9 L196.8,302.7 L194.1,298.3 L193.2,299.2 L187.0,294.7 L187.0,291.2 L188.8,287.6 L185.2,284.9 L179.9,284.0 L178.1,280.5 Z',
        'M238.7,276.0 L236.0,276.0 L235.1,275.1 L233.3,276.0 L232.4,275.1 L230.6,275.1 L228.0,276.9 L223.5,285.8 L220.8,284.0 L220.0,284.9 L217.3,282.2 L214.6,281.4 L203.9,286.7 L199.5,291.2 L199.5,292.0 L197.7,292.9 L196.8,295.6 L197.7,296.5 L201.2,296.5 L205.7,298.3 L206.6,299.2 L206.6,301.0 L205.7,301.8 L205.7,307.2 L211.9,312.5 L212.8,312.5 L213.7,314.3 L217.3,316.1 L219.1,314.3 L221.7,308.1 L230.6,300.1 L235.1,299.2 L239.5,303.6 L240.4,306.3 L242.2,307.2 L242.2,306.3 L246.7,301.8 L246.7,300.1 L248.5,298.3 L249.3,295.6 L252.0,292.9 L252.9,288.5 L252.0,287.6 L250.2,287.6 L249.3,285.8 Z',
        'M322.4,194.1 L321.5,194.1 L320.6,193.2 L317.9,193.2 L313.5,197.6 L313.5,198.5 L311.7,200.3 L311.7,203.0 L310.8,203.9 L311.7,204.8 L314.4,204.8 L315.2,205.7 L314.4,206.5 L314.4,207.4 L312.6,209.2 L312.6,211.0 L315.2,211.0 L316.1,210.1 L317.9,210.1 L320.6,207.4 L321.5,207.4 L321.5,206.5 L324.2,203.9 L324.2,202.1 L320.6,202.1 L319.7,201.2 L322.4,198.5 Z',
        'M146.9,360.6 L144.2,360.6 L143.4,361.5 L143.4,362.4 L140.7,365.1 L139.8,365.1 L138.9,364.2 L138.0,364.2 L137.1,363.3 L136.2,364.2 L136.2,366.9 L134.5,368.6 L133.6,368.6 L131.8,370.4 L132.7,371.3 L132.7,373.1 L130.0,375.8 L130.0,376.7 L132.7,379.3 L133.6,379.3 L134.5,378.4 L134.5,377.5 L136.2,375.8 L138.0,375.8 L138.0,374.9 L138.9,374.0 L138.9,372.2 L139.8,371.3 L140.7,371.3 L142.5,369.5 L143.4,369.5 L143.4,368.6 L144.2,367.8 L145.1,368.6 L145.1,367.8 L146.0,366.9 L146.9,366.9 L148.7,365.1 L148.7,362.4 Z'
    ];
    shapes.forEach(d => {
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', d); p.setAttribute('class', 'land'); g.appendChild(p);
    });
}

let currentZoomK = 1;

function initZoom() {
    // d3.jsによるズーム・パニング機能の初期化
    const svg = d3.select("#jsvg");
    const zoomGroup = d3.select("#zoom-group");
    
    const zoom = d3.zoom()
        .scaleExtent([0.8, 8]) // 縮小・拡大の限界値
        .on("zoom", (event) => {
            currentZoomK = event.transform.k;
            const effectiveK = Math.min(currentZoomK, 2.5); // 2.5倍以上は円を縮小しない
            // スクロールやピンチによる変形を zoom-group に適用
            zoomGroup.attr("transform", event.transform);
            
            // ズーム倍率に合わせて円のサイズや線の太さを小さくする（見た目の大きさを保つ）
            d3.selectAll(".bubble").each(function(d) {
                const baseR = d ? d.baseR : parseFloat(this.getAttribute('data-r'));
                d3.select(this).attr('r', baseR / effectiveK);
                d3.select(this).style('stroke-width', `${1.2 / effectiveK}px`);
            });

            // バブルのラベル（文字）が円のサイズに合わせて調整されるようにする
            d3.selectAll(".blabel")
                .style("font-size", d => {
                    const len = d.n.length > 3 ? 3 : d.n.length;
                    const R = d.baseR / effectiveK;
                    // 文字幅が円の直径(2R)に収まるように計算し、最大サイズも制限
                    return `${Math.min((R * 1.6) / len, 10 / effectiveK)}px`;
                });
        });
        
    svg.call(zoom);

    // 初期表示の倍率と位置を調整（画面いっぱいに表示）
    const initialTransform = d3.zoomIdentity.translate(-165, -15).scale(1.5);
    svg.call(zoom.transform, initialTransform);
}

let INITIAL_MAX_POP = null;

function renderMap() {
    let data = computePerPref();
    data = data.filter(p => p.filtered > 0); // 0人の県は除外
    const total = data.reduce((s, p) => s + p.filtered, 0);
    
    // ページを開いた最初の状態（未婚・20〜60歳など）での最大人口を基準として記憶する
    if (INITIAL_MAX_POP === null) {
        INITIAL_MAX_POP = Math.max(...data.map(p => p.filtered), 1);
    }
    
    // 現在のフィルター条件下での「1位の県」の人口
    const currentMaxF = Math.max(...data.map(p => p.filtered), 1);
    
    // ハイブリッド方式：
    // 「その時の1位の県」の円のサイズを、全体の人口減少に合わせて 35px 〜 18px の間で縮ませる
    const current_MAX_R = 18 + (35 - 18) * Math.sqrt(Math.min(1.0, currentMaxF / INITIAL_MAX_POP));
    const MIN_R = 4; // 最小サイズを4pxに戻す（相対評価により、自然な差が出るため）

    // データの準備
    data.forEach(p => {
        // 各県の円の大きさは、「その時の1位の県（currentMaxF）」に対する相対比率（ratio）で決める。
        // これにより、全体が数十万人規模に減った時でも、県同士の差がはっきりと視覚化されます。
        const ratio = p.filtered / currentMaxF;
        p.baseR = MIN_R + (current_MAX_R - MIN_R) * Math.sqrt(ratio);
    });

    const layer = d3.select('#bubble-layer');

    // D3 Data Join
    const groups = layer.selectAll('.bubble-group')
        .data(data, d => d.n) // 都道府県名でバインディング
        .join('g')
        .attr('class', 'bubble-group');

    const effectiveK = Math.min(currentZoomK, 2.5);

    // 円（バブル）
    groups.selectAll('.bubble')
        .data(d => [d])
        .join('circle')
        .attr('class', 'bubble')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.baseR / effectiveK)
        .attr('data-r', d => d.baseR)
        .style('stroke-width', `${1.2 / effectiveK}px`)
        .on('mouseenter', (event, d) => showTip(event, d.n, d.filtered, total))
        .on('mouseleave', hideTip)
        .on('mousemove', moveTip)
        .call(d3.drag()
            .filter(() => editMode)
            .on('start', function() {
                d3.select(this).style('stroke', '#ff0000').style('stroke-width', '2px');
            })
            .on('drag', function(event, d) {
                d.x += event.dx;
                d.y += event.dy;
                d3.select(this).attr('cx', d.x).attr('cy', d.y);
                const pref = PREFS.find(p => p.n === d.n);
                if (pref) { pref.x = d.x; pref.y = d.y; }
                d3.select(this.parentNode).select('.blabel').attr('x', d.x).attr('y', d.y);
            })
            .on('end', function() {
                d3.select(this).style('stroke', 'rgba(255, 255, 255, .85)').style('stroke-width', '1.2');
            })
        );

    // ラベル（都道府県名）
    groups.selectAll('.blabel')
        .data(d => [d])
        .join('text')
        .attr('class', 'blabel')
        .text(d => d.n.length > 3 ? d.n.slice(0, 3) : d.n)
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .style('font-size', d => {
            const len = d.n.length > 3 ? 3 : d.n.length;
            const R = d.baseR / effectiveK;
            return `${Math.min((R * 1.6) / len, 10 / effectiveK)}px`;
        })
        .style('text-anchor', 'middle')
        .style('fill', '#fff')
        .style('pointer-events', 'none');

    // パネルの更新
    document.getElementById('panel-num').textContent = total.toLocaleString('ja-JP');
    const pct = total / TOTAL * 100;
    document.getElementById('panel-pct').textContent = pct.toFixed(pct < 0.001 ? 4 : pct < 0.1 ? 3 : pct < 1 ? 2 : 1);
    document.getElementById('topbar-total').textContent = total.toLocaleString('ja-JP') + ' 人';

    // 選択条件ピルの更新
    const items = filterItems();
    const pb = document.getElementById('pills-bar');
    pb.innerHTML = items.length
        ? items.map(i => `<span class="pill">${i.k}: ${i.v}</span>`).join('')
        : '<span class="pill-none">条件なし（全人口）</span>';

    // 適用条件サマリー
    const fsl = document.getElementById('fs-list');
    fsl.innerHTML = items.length
        ? items.map(i => `<div class="fsrow"><span class="fskey">${i.k}</span><span class="fsval">${i.v}</span></div>`).join('')
        : '<span style="font-size:.72rem;color:var(--muted)">条件なし</span>';

    // ランキングの更新
    const sorted = [...data].sort((a, b) => b.filtered - a.filtered).slice(0, 20);
    const maxR = sorted[0]?.filtered || 1;
    document.getElementById('rank-list').innerHTML = sorted.map((p, i) => {
        const ps = p.filtered >= 10000 ? `${(p.filtered / 10000).toFixed(0)}万` : p.filtered.toLocaleString();
        return `<div class="rank-row">
      <span class="rn">${i + 1}</span>
      <span class="rname">${p.n}</span>
      <div class="rbar-w"><div class="rbar" style="width:${(p.filtered / maxR * 100).toFixed(1)}%"></div></div>
      <span class="rpop">${ps}</span>
    </div>`;
    }).join('');
}

// Tooltip
function showTip(e, name, pop, total) {
    const t = document.getElementById('tip');
    const ps = pop >= 10000 ? `約${(pop / 10000).toFixed(1)}万人` : pop.toLocaleString() + '人';
    t.innerHTML = `<strong>${name}</strong>${ps}　(${(pop / total * 100).toFixed(1)}%)`;
    t.classList.add('show'); moveTip(e);
}
function hideTip() { document.getElementById('tip').classList.remove('show'); }
function moveTip(e) {
    const a = document.getElementById('map-area').getBoundingClientRect();
    const t = document.getElementById('tip');
    let lx = e.clientX - a.left + 14, ly = e.clientY - a.top - 44;
    if (lx + 185 > a.width) lx -= 195;
    if (ly < 0) ly = 8;
    t.style.left = lx + 'px'; t.style.top = ly + 'px';
}

// ══════════════════════════════════════════════════
// PAGE / CONTROLS
// ══════════════════════════════════════════════════
function showPage(n) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + n).classList.add('active');
    document.getElementById('tab-' + n).classList.add('active');
    if (n === 'map') renderMap();
}

// シングル選択
function setupSingleTog(gid, key, chipId, labelFn) {
    document.getElementById(gid).querySelectorAll('.tog').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById(gid).querySelectorAll('.tog').forEach(b => b.classList.remove('on'));
            btn.classList.add('on');
            S[key] = btn.dataset.v;
            const isAll = btn.dataset.v === 'all';
            document.getElementById(chipId).textContent = isAll ? '指定なし' : labelFn(btn);
            document.getElementById('fc-' + key).classList.toggle('active', !isAll);
            updateBadge();
        });
    });
}
setupSingleTog('tg-sex', 'sex', 'chip-sex', b => b.textContent);
setupSingleTog('tg-edu', 'edu', 'chip-edu', b => EDU_L[b.dataset.v] || b.textContent);
// setupSingleTog('tg-income','income','chip-income',b=>INC_L[b.dataset.v]||b.textContent);

// マルチ選択
function setupMultiTog(gid, stateSet, chipId, labelMap, cardId) {
    document.getElementById(gid).querySelectorAll('.tog').forEach(btn => {
        btn.addEventListener('click', () => {
            const v = btn.dataset.v;
            if (stateSet.has(v)) { stateSet.delete(v); btn.classList.remove('on'); }
            else { stateSet.add(v); btn.classList.add('on'); }
            const sz = stateSet.size;
            document.getElementById(chipId).textContent =
                sz === 0 ? '指定なし' : sz === 1 ? labelMap[[...stateSet][0]] : `${sz}項目選択`;
            document.getElementById(cardId).classList.toggle('active', sz > 0);
            updateBadge();
        });
    });
}
setupMultiTog('tg-marital', S.marital, 'chip-marital', MAR_L, 'fc-marital');
// setupMultiTog('tg-occ', S.occ, 'chip-occ', OCC_L, 'fc-occ');

// 年齢スライダー
function syncAge() {

    const MIN = 20;
    const MAX = 60;

    S.ageMin = parseInt(document.getElementById('age-lo').value);
    S.ageMax = parseInt(document.getElementById('age-hi').value);

    // 0〜100%に変換（これが超重要）
    const left = ((S.ageMin - MIN) / (MAX - MIN)) * 100;
    const right = ((S.ageMax - MIN) / (MAX - MIN)) * 100;

    const fill = document.getElementById('age-fill');
    fill.style.left = left + '%';
    fill.style.width = (right - left) + '%';

    const lbl = `${S.ageMin}〜${S.ageMax}歳`;
    document.getElementById('age-mid').textContent = lbl;
    document.getElementById('chip-age').textContent = lbl;

    // active判定も修正
    document.getElementById('fc-age')
        .classList.toggle('active', S.ageMin > 20 || S.ageMax < 60);

    updateBadge();
}
document.getElementById('age-lo').addEventListener('input', e => {
    if (+e.target.value >= S.ageMax) e.target.value = S.ageMax - 1; syncAge();
});
document.getElementById('age-hi').addEventListener('input', e => {
    if (+e.target.value <= S.ageMin) e.target.value = S.ageMin + 1; syncAge();
});

// 年収スライダー
function syncIncome() {
    const MIN = 0;
    const MAX = 1000;

    S.incomeMin = parseInt(document.getElementById('income-lo').value);
    S.incomeMax = parseInt(document.getElementById('income-hi').value);

    const left = ((S.incomeMin - MIN) / (MAX - MIN)) * 100;
    const right = ((S.incomeMax - MIN) / (MAX - MIN)) * 100;

    const fill = document.getElementById('income-fill');
    fill.style.left = left + '%';
    fill.style.width = (right - left) + '%';

    const midLbl = `${S.incomeMin}〜${S.incomeMax}万円` + (S.incomeMax === 1000 ? '以上' : '');
    document.getElementById('income-mid').textContent = midLbl;

    const chipLbl = S.incomeMin === 0 && S.incomeMax === 1000 ? '指定なし' : midLbl;
    document.getElementById('chip-income').textContent = chipLbl;

    document.getElementById('fc-income')
        .classList.toggle('active', S.incomeMin > 0 || S.incomeMax < 1000);

    updateBadge();
}
document.getElementById('income-lo').addEventListener('input', e => {
    if (+e.target.value >= S.incomeMax) e.target.value = S.incomeMax - 50; syncIncome();
});
document.getElementById('income-hi').addEventListener('input', e => {
    if (+e.target.value <= S.incomeMin) e.target.value = S.incomeMin + 50; syncIncome();
});

function updateBadge() {
    const r = globalRatio();
    const t = Math.round(TOTAL * r);
    document.getElementById('topbar-total').textContent = t.toLocaleString('ja-JP') + ' 人';
    renderMap();
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    buildMap();
    renderMap();
    initZoom();

    setTimeout(() => {
        syncAge();
        syncIncome();
        updateBadge();
    }, 0);
});

document.addEventListener('DOMContentLoaded', () => {
    const btnEdit = document.getElementById('btn-edit-mode');
    if (btnEdit) {
        btnEdit.addEventListener('click', (e) => {
            editMode = !editMode;
            e.target.textContent = editMode ? '✏️ 編集モード: ON' : '✏️ 編集モード: OFF';
            d3.selectAll('.bubble').style('cursor', editMode ? 'grab' : 'pointer');
        });
    }

    const btnExport = document.getElementById('btn-export');
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            const exported = PREFS.map(p => ({n: p.n, x: Math.round(p.x*10)/10, y: Math.round(p.y*10)/10}));
            console.log(JSON.stringify(exported));
            alert('コンソールに新しい座標データを出力しました！コピーしてください。');
        });
    }
});
