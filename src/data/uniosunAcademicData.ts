import { Faculty, Department } from '../types';

export interface AcademicUnit {
  faculty: Faculty;
  departments: Department[];
}

export const UNIOSUN_UNIVERSITY_ID = 'uni-uniosun';

export const UNIOSUN_ACADEMIC_STRUCTURE: AcademicUnit[] = [
  {
    faculty: {
      id: 'fac-computing',
      universityId: UNIOSUN_UNIVERSITY_ID,
      name: 'Faculty of Computing and Information Technology (FOCIT)',
      status: 'active',
    },
    departments: [
      { id: 'dept-comp-cs', facultyId: 'fac-computing', name: 'Computer Science', status: 'active' },
      { id: 'dept-comp-cyber', facultyId: 'fac-computing', name: 'Cyber Security', status: 'active' },
      { id: 'dept-comp-ds', facultyId: 'fac-computing', name: 'Data Science', status: 'active' },
      { id: 'dept-comp-is', facultyId: 'fac-computing', name: 'Information Systems', status: 'active' },
      { id: 'dept-comp-it', facultyId: 'fac-computing', name: 'Information Technology', status: 'active' },
      { id: 'dept-comp-lis', facultyId: 'fac-computing', name: 'Library and Information Science', status: 'active' },
      { id: 'dept-comp-se', facultyId: 'fac-computing', name: 'Software Engineering', status: 'active' },
    ],
  },
  {
    faculty: {
      id: 'fac-eng',
      universityId: UNIOSUN_UNIVERSITY_ID,
      name: 'Faculty of Engineering',
      status: 'active',
    },
    departments: [
      { id: 'dept-eng-agric', facultyId: 'fac-eng', name: 'Agricultural Engineering', status: 'active' },
      { id: 'dept-eng-chem', facultyId: 'fac-eng', name: 'Chemical Engineering', status: 'active' },
      { id: 'dept-eng-civil', facultyId: 'fac-eng', name: 'Civil Engineering', status: 'active' },
      { id: 'dept-eng-comp', facultyId: 'fac-eng', name: 'Computer Engineering', status: 'active' },
      { id: 'dept-eng-elect', facultyId: 'fac-eng', name: 'Electrical & Electronics Engineering', status: 'active' },
      { id: 'dept-mech', facultyId: 'fac-eng', name: 'Mechanical Engineering', status: 'active' },
      { id: 'dept-eng-mechatronics', facultyId: 'fac-eng', name: 'Mechatronics Engineering', status: 'active' },
    ],
  },
  {
    faculty: {
      id: 'fac-science',
      universityId: UNIOSUN_UNIVERSITY_ID,
      name: 'Faculty of Basic and Applied Sciences',
      status: 'active',
    },
    departments: [
      { id: 'dept-sci-zoo', facultyId: 'fac-science', name: 'Animal and Environmental Biology', status: 'active' },
      { id: 'dept-sci-biochem', facultyId: 'fac-science', name: 'Biochemistry', status: 'active' },
      { id: 'dept-sci-biotech', facultyId: 'fac-science', name: 'Biotechnology', status: 'active' },
      { id: 'dept-sci-chem', facultyId: 'fac-science', name: 'Chemistry', status: 'active' },
      { id: 'dept-sci-geol', facultyId: 'fac-science', name: 'Geology', status: 'active' },
      { id: 'dept-sci-ind-chem', facultyId: 'fac-science', name: 'Industrial Chemistry', status: 'active' },
      { id: 'dept-sci-math', facultyId: 'fac-science', name: 'Mathematics', status: 'active' },
      { id: 'dept-sci-micro', facultyId: 'fac-science', name: 'Microbiology', status: 'active' },
      { id: 'dept-sci-physics', facultyId: 'fac-science', name: 'Physics with Electronics', status: 'active' },
      { id: 'dept-sci-plant', facultyId: 'fac-science', name: 'Plant Biology', status: 'active' },
      { id: 'dept-sci-stats', facultyId: 'fac-science', name: 'Statistics', status: 'active' },
    ],
  },
  {
    faculty: {
      id: 'fac-env',
      universityId: UNIOSUN_UNIVERSITY_ID,
      name: 'Faculty of Environmental Sciences',
      status: 'active',
    },
    departments: [
      { id: 'dept-env-arch', facultyId: 'fac-env', name: 'Architecture', status: 'active' },
      { id: 'dept-env-building', facultyId: 'fac-env', name: 'Building', status: 'active' },
      { id: 'dept-env-estate', facultyId: 'fac-env', name: 'Estate Management', status: 'active' },
      { id: 'dept-env-food', facultyId: 'fac-env', name: 'Food Science and Technology', status: 'active' },
      { id: 'dept-env-qs', facultyId: 'fac-env', name: 'Quantity Surveying', status: 'active' },
      { id: 'dept-env-urp', facultyId: 'fac-env', name: 'Urban and Regional Planning', status: 'active' },
    ],
  },
  {
    faculty: {
      id: 'fac-mgmt-sci',
      universityId: UNIOSUN_UNIVERSITY_ID,
      name: 'Faculty of Management Sciences (Okuku Campus)',
      status: 'active',
    },
    departments: [
      { id: 'dept-mgmt-acc', facultyId: 'fac-mgmt-sci', name: 'Accounting', status: 'active' },
      { id: 'dept-mgmt-bank', facultyId: 'fac-mgmt-sci', name: 'Banking and Finance', status: 'active' },
      { id: 'dept-mgmt-busadmin', facultyId: 'fac-mgmt-sci', name: 'Business Administration', status: 'active' },
      { id: 'dept-mgmt-coop', facultyId: 'fac-mgmt-sci', name: 'Cooperative and Rural Development', status: 'active' },
      { id: 'dept-mgmt-entrep', facultyId: 'fac-mgmt-sci', name: 'Entrepreneurship', status: 'active' },
      { id: 'dept-mgmt-irpm', facultyId: 'fac-mgmt-sci', name: 'Industrial Relations and Personnel Management (IRPM)', status: 'active' },
      { id: 'dept-mgmt-mkt', facultyId: 'fac-mgmt-sci', name: 'Marketing', status: 'active' },
      { id: 'dept-mgmt-pubadmin', facultyId: 'fac-mgmt-sci', name: 'Public Administration', status: 'active' },
    ],
  },
  {
    faculty: {
      id: 'fac-socsci',
      universityId: UNIOSUN_UNIVERSITY_ID,
      name: 'Faculty of Social Sciences (Okuku Campus)',
      status: 'active',
    },
    departments: [
      { id: 'dept-soc-demo', facultyId: 'fac-socsci', name: 'Demography and Social Statistics', status: 'active' },
      { id: 'dept-soc-econ', facultyId: 'fac-socsci', name: 'Economics', status: 'active' },
      { id: 'dept-soc-geog', facultyId: 'fac-socsci', name: 'Geography', status: 'active' },
      { id: 'dept-soc-ird', facultyId: 'fac-socsci', name: 'International Relations and Diplomacy', status: 'active' },
      { id: 'dept-soc-polsci', facultyId: 'fac-socsci', name: 'Political Science and International Relations', status: 'active' },
      { id: 'dept-soc-psych', facultyId: 'fac-socsci', name: 'Psychology', status: 'active' },
      { id: 'dept-soc-work', facultyId: 'fac-socsci', name: 'Social Work', status: 'active' },
      { id: 'dept-soc-socio', facultyId: 'fac-socsci', name: 'Sociology', status: 'active' },
    ],
  },
  {
    faculty: {
      id: 'fac-humanities',
      universityId: UNIOSUN_UNIVERSITY_ID,
      name: 'Faculty of Humanities and Culture (Ikire Campus)',
      status: 'active',
    },
    departments: [
      { id: 'dept-hum-arabic', facultyId: 'fac-humanities', name: 'Arabic Language and Literature', status: 'active' },
      { id: 'dept-hum-crs', facultyId: 'fac-humanities', name: 'Christian Religious Studies', status: 'active' },
      { id: 'dept-hum-eng', facultyId: 'fac-humanities', name: 'English and International Studies', status: 'active' },
      { id: 'dept-hum-french', facultyId: 'fac-humanities', name: 'French and International Studies', status: 'active' },
      { id: 'dept-hum-history', facultyId: 'fac-humanities', name: 'History and International Studies', status: 'active' },
      { id: 'dept-hum-ling', facultyId: 'fac-humanities', name: 'Linguistics and Communication Studies', status: 'active' },
      { id: 'dept-hum-theatre', facultyId: 'fac-humanities', name: 'Performing Arts (Theatre Arts)', status: 'active' },
      { id: 'dept-hum-phil', facultyId: 'fac-humanities', name: 'Philosophy', status: 'active' },
      { id: 'dept-hum-yoruba', facultyId: 'fac-humanities', name: 'Yoruba', status: 'active' },
    ],
  },
  {
    faculty: {
      id: 'fac-law',
      universityId: UNIOSUN_UNIVERSITY_ID,
      name: 'Faculty of Law (Ifetedo Campus)',
      status: 'active',
    },
    departments: [
      { id: 'dept-law-common', facultyId: 'fac-law', name: 'Common Law (LL.B)', status: 'active' },
      { id: 'dept-law-islamic', facultyId: 'fac-law', name: 'Islamic Law (LL.B)', status: 'active' },
      { id: 'dept-law-comm-ind', facultyId: 'fac-law', name: 'Commercial and Industrial Law', status: 'active' },
      { id: 'dept-law-priv-prop', facultyId: 'fac-law', name: 'Private and Property Law', status: 'active' },
      { id: 'dept-law-public-intl', facultyId: 'fac-law', name: 'Public and International Law', status: 'active' },
    ],
  },
  {
    faculty: {
      id: 'fac-basic-med',
      universityId: UNIOSUN_UNIVERSITY_ID,
      name: 'College of Health Sciences - Faculty of Basic Medical Sciences',
      status: 'active',
    },
    departments: [
      { id: 'dept-med-anatomy', facultyId: 'fac-basic-med', name: 'Anatomy', status: 'active' },
      { id: 'dept-med-mls', facultyId: 'fac-basic-med', name: 'Medical Laboratory Science', status: 'active' },
      { id: 'dept-med-pharm', facultyId: 'fac-basic-med', name: 'Pharmacology', status: 'active' },
      { id: 'dept-med-physio', facultyId: 'fac-basic-med', name: 'Physiology', status: 'active' },
    ],
  },
  {
    faculty: {
      id: 'fac-clinical-sciences',
      universityId: UNIOSUN_UNIVERSITY_ID,
      name: 'College of Health Sciences - Faculty of Clinical Sciences',
      status: 'active',
    },
    departments: [
      { id: 'dept-clin-mbbs', facultyId: 'fac-clinical-sciences', name: 'Medicine and Surgery (M.B.B.S.)', status: 'active' },
      { id: 'dept-clin-comm', facultyId: 'fac-clinical-sciences', name: 'Community Medicine', status: 'active' },
      { id: 'dept-clin-internal', facultyId: 'fac-clinical-sciences', name: 'Internal Medicine', status: 'active' },
      { id: 'dept-clin-obgyn', facultyId: 'fac-clinical-sciences', name: 'Obstetrics and Gynaecology', status: 'active' },
      { id: 'dept-clin-paed', facultyId: 'fac-clinical-sciences', name: 'Paediatrics', status: 'active' },
      { id: 'dept-clin-surg', facultyId: 'fac-clinical-sciences', name: 'Surgery', status: 'active' },
    ],
  },
  {
    faculty: {
      id: 'fac-nursing-allied',
      universityId: UNIOSUN_UNIVERSITY_ID,
      name: 'College of Health Sciences - Faculty of Nursing & Allied Health Sciences',
      status: 'active',
    },
    departments: [
      { id: 'dept-allied-nursing', facultyId: 'fac-nursing-allied', name: 'Nursing Science', status: 'active' },
      { id: 'dept-allied-envhealth', facultyId: 'fac-nursing-allied', name: 'Environmental Health Science', status: 'active' },
      { id: 'dept-allied-him', facultyId: 'fac-nursing-allied', name: 'Health Information Management', status: 'active' },
      { id: 'dept-allied-nutrition', facultyId: 'fac-nursing-allied', name: 'Human Nutrition and Dietetics', status: 'active' },
      { id: 'dept-allied-pubhealth', facultyId: 'fac-nursing-allied', name: 'Public Health', status: 'active' },
      { id: 'dept-allied-radiography', facultyId: 'fac-nursing-allied', name: 'Radiography and Radiation Science', status: 'active' },
    ],
  },
  {
    faculty: {
      id: 'fac-edu',
      universityId: UNIOSUN_UNIVERSITY_ID,
      name: 'Faculty of Education (Ipetu-Ijesha Campus)',
      status: 'active',
    },
    departments: [
      { id: 'dept-edu-adult', facultyId: 'fac-edu', name: 'Adult & Continuing Education', status: 'active' },
      { id: 'dept-edu-art-soc', facultyId: 'fac-edu', name: 'Arts and Social Science Education', status: 'active' },
      { id: 'dept-edu-bus', facultyId: 'fac-edu', name: 'Business Education', status: 'active' },
      { id: 'dept-edu-mgmt', facultyId: 'fac-edu', name: 'Educational Management', status: 'active' },
      { id: 'dept-edu-tech', facultyId: 'fac-edu', name: 'Educational Technology', status: 'active' },
      { id: 'dept-edu-env', facultyId: 'fac-edu', name: 'Environmental Education', status: 'active' },
      { id: 'dept-edu-gc', facultyId: 'fac-edu', name: 'Guidance and Counselling', status: 'active' },
      { id: 'dept-edu-stem', facultyId: 'fac-edu', name: 'Science, Technology & Mathematics Education', status: 'active' },
    ],
  },
  {
    faculty: {
      id: 'fac-agric',
      universityId: UNIOSUN_UNIVERSITY_ID,
      name: 'Faculty of Agriculture (Ejigbo Campus)',
      status: 'active',
    },
    departments: [
      { id: 'dept-agric-econ-agribus', facultyId: 'fac-agric', name: 'Agricultural Economics and Agribusiness Management', status: 'active' },
      { id: 'dept-agric-ext-rural', facultyId: 'fac-agric', name: 'Agricultural Extension and Rural Development', status: 'active' },
      { id: 'dept-agric-agronomy', facultyId: 'fac-agric', name: 'Agronomy', status: 'active' },
      { id: 'dept-agric-animal-sci', facultyId: 'fac-agric', name: 'Animal Science', status: 'active' },
      { id: 'dept-agric-fisheries', facultyId: 'fac-agric', name: 'Fisheries and Aquaculture', status: 'active' },
    ],
  },
  {
    faculty: {
      id: 'fac-renewable-res',
      universityId: UNIOSUN_UNIVERSITY_ID,
      name: 'Faculty of Renewable Natural Resources (Ejigbo Campus)',
      status: 'active',
    },
    departments: [
      { id: 'dept-renew-fisheries-mgmt', facultyId: 'fac-renewable-res', name: 'Fisheries Management', status: 'active' },
      { id: 'dept-renew-forestry', facultyId: 'fac-renewable-res', name: 'Forest Resources Management (Forestry)', status: 'active' },
      { id: 'dept-renew-wildlife', facultyId: 'fac-renewable-res', name: 'Wildlife Management and Ecotourism', status: 'active' },
    ],
  },
];

// Flat lists for backward compatibility & easy lookup
export const ALL_UNIOSUN_FACULTIES: Faculty[] = UNIOSUN_ACADEMIC_STRUCTURE.map((u) => u.faculty);

export const ALL_UNIOSUN_DEPARTMENTS: Department[] = UNIOSUN_ACADEMIC_STRUCTURE.flatMap((u) => u.departments);

/**
 * Get all verified UNIOSUN faculties
 */
export function getUNIOSUNFaculties(): Faculty[] {
  return ALL_UNIOSUN_FACULTIES;
}

/**
 * Get departments strictly filtered by the selected faculty
 */
export function getUNIOSUNDepartmentsByFaculty(facultyId?: string): Department[] {
  if (!facultyId) return [];
  const unit = UNIOSUN_ACADEMIC_STRUCTURE.find((u) => u.faculty.id === facultyId);
  return unit ? unit.departments : [];
}

/**
 * Lookup faculty by ID or Name
 */
export function findUNIOSUNFaculty(facultyIdOrName?: string): Faculty | undefined {
  if (!facultyIdOrName) return undefined;
  const clean = facultyIdOrName.trim().toLowerCase();
  return ALL_UNIOSUN_FACULTIES.find(
    (f) => f.id.toLowerCase() === clean || f.name.toLowerCase() === clean || f.name.toLowerCase().includes(clean)
  );
}

/**
 * Lookup department by ID or Name
 */
export function findUNIOSUNDepartment(departmentIdOrName?: string): Department | undefined {
  if (!departmentIdOrName) return undefined;
  const clean = departmentIdOrName.trim().toLowerCase();
  return ALL_UNIOSUN_DEPARTMENTS.find(
    (d) => d.id.toLowerCase() === clean || d.name.toLowerCase() === clean
  );
}

/**
 * Validate that a department strictly belongs to a given faculty
 */
export function isDepartmentInFaculty(facultyId: string, departmentId: string): boolean {
  if (!facultyId || !departmentId) return false;
  const unit = UNIOSUN_ACADEMIC_STRUCTURE.find((u) => u.faculty.id === facultyId);
  if (!unit) return false;
  return unit.departments.some((d) => d.id === departmentId);
}
