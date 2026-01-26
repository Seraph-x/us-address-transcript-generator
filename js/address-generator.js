/**
 * US Address Generator Module
 * Generates realistic US addresses with names, phone numbers (no email)
 */

const AddressGenerator = {
    // US States only (no Canada)
    states: {
        'AL': { name: 'Alabama', areaCodes: ['205', '251', '256', '334'] },
        'AK': { name: 'Alaska', areaCodes: ['907'] },
        'AZ': { name: 'Arizona', areaCodes: ['480', '520', '602', '623', '928'] },
        'AR': { name: 'Arkansas', areaCodes: ['479', '501', '870'] },
        'CA': { name: 'California', areaCodes: ['213', '310', '323', '408', '415', '510', '562', '619', '650', '714', '818', '858', '909', '949'] },
        'CO': { name: 'Colorado', areaCodes: ['303', '719', '720', '970'] },
        'CT': { name: 'Connecticut', areaCodes: ['203', '475', '860'] },
        'DE': { name: 'Delaware', areaCodes: ['302'] },
        'FL': { name: 'Florida', areaCodes: ['305', '321', '352', '386', '407', '561', '727', '754', '786', '813', '850', '863', '904', '941', '954'] },
        'GA': { name: 'Georgia', areaCodes: ['229', '404', '470', '478', '678', '706', '762', '770', '912'] },
        'HI': { name: 'Hawaii', areaCodes: ['808'] },
        'ID': { name: 'Idaho', areaCodes: ['208', '986'] },
        'IL': { name: 'Illinois', areaCodes: ['217', '224', '309', '312', '331', '618', '630', '708', '773', '815', '847', '872'] },
        'IN': { name: 'Indiana', areaCodes: ['219', '260', '317', '463', '574', '765', '812', '930'] },
        'IA': { name: 'Iowa', areaCodes: ['319', '515', '563', '641', '712'] },
        'KS': { name: 'Kansas', areaCodes: ['316', '620', '785', '913'] },
        'KY': { name: 'Kentucky', areaCodes: ['270', '364', '502', '606', '859'] },
        'LA': { name: 'Louisiana', areaCodes: ['225', '318', '337', '504', '985'] },
        'ME': { name: 'Maine', areaCodes: ['207'] },
        'MD': { name: 'Maryland', areaCodes: ['240', '301', '410', '443', '667'] },
        'MA': { name: 'Massachusetts', areaCodes: ['339', '351', '413', '508', '617', '774', '781', '857', '978'] },
        'MI': { name: 'Michigan', areaCodes: ['231', '248', '269', '313', '517', '586', '616', '734', '810', '906', '947', '989'] },
        'MN': { name: 'Minnesota', areaCodes: ['218', '320', '507', '612', '651', '763', '952'] },
        'MS': { name: 'Mississippi', areaCodes: ['228', '601', '662', '769'] },
        'MO': { name: 'Missouri', areaCodes: ['314', '417', '573', '636', '660', '816'] },
        'MT': { name: 'Montana', areaCodes: ['406'] },
        'NE': { name: 'Nebraska', areaCodes: ['308', '402', '531'] },
        'NV': { name: 'Nevada', areaCodes: ['702', '725', '775'] },
        'NH': { name: 'New Hampshire', areaCodes: ['603'] },
        'NJ': { name: 'New Jersey', areaCodes: ['201', '551', '609', '732', '848', '856', '862', '908', '973'] },
        'NM': { name: 'New Mexico', areaCodes: ['505', '575'] },
        'NY': { name: 'New York', areaCodes: ['212', '315', '332', '347', '516', '518', '585', '607', '631', '646', '680', '716', '718', '845', '914', '917', '929', '934'] },
        'NC': { name: 'North Carolina', areaCodes: ['252', '336', '704', '743', '828', '910', '919', '980', '984'] },
        'ND': { name: 'North Dakota', areaCodes: ['701'] },
        'OH': { name: 'Ohio', areaCodes: ['216', '220', '234', '330', '380', '419', '440', '513', '567', '614', '740', '937'] },
        'OK': { name: 'Oklahoma', areaCodes: ['405', '539', '580', '918'] },
        'OR': { name: 'Oregon', areaCodes: ['458', '503', '541', '971'] },
        'PA': { name: 'Pennsylvania', areaCodes: ['215', '223', '267', '272', '412', '484', '570', '610', '717', '724', '814', '878'] },
        'RI': { name: 'Rhode Island', areaCodes: ['401'] },
        'SC': { name: 'South Carolina', areaCodes: ['803', '843', '854', '864'] },
        'SD': { name: 'South Dakota', areaCodes: ['605'] },
        'TN': { name: 'Tennessee', areaCodes: ['423', '615', '629', '731', '865', '901', '931'] },
        'TX': { name: 'Texas', areaCodes: ['210', '214', '254', '281', '325', '346', '361', '409', '430', '432', '469', '512', '682', '713', '737', '806', '817', '830', '832', '903', '915', '936', '940', '956', '972', '979'] },
        'UT': { name: 'Utah', areaCodes: ['385', '435', '801'] },
        'VT': { name: 'Vermont', areaCodes: ['802'] },
        'VA': { name: 'Virginia', areaCodes: ['276', '434', '540', '571', '703', '757', '804'] },
        'WA': { name: 'Washington', areaCodes: ['206', '253', '360', '425', '509', '564'] },
        'WV': { name: 'West Virginia', areaCodes: ['304', '681'] },
        'WI': { name: 'Wisconsin', areaCodes: ['262', '414', '534', '608', '715', '920'] },
        'WY': { name: 'Wyoming', areaCodes: ['307'] },
        'DC': { name: 'District of Columbia', areaCodes: ['202'] }
    },

    // Common street names
    streetNames: [
        'Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Washington', 'Lake', 'Hill', 'Park',
        'Forest', 'River', 'Valley', 'Spring', 'Sunset', 'Highland', 'Garden', 'Willow', 'Meadow', 'Ridge',
        'Birch', 'Cherry', 'Walnut', 'Hickory', 'Chestnut', 'Laurel', 'Rose', 'Magnolia', 'Peach', 'Apple'
    ],

    streetTypes: ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Rd', 'Way', 'Ct', 'Pl', 'Cir'],

    // Common first names
    maleNames: ['James', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Andrew', 'Paul', 'Joshua', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan', 'Jacob', 'Nicholas', 'Gary', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Raymond', 'Gregory', 'Nathan', 'Patrick', 'Alexander', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Adam'],

    femaleNames: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Dorothy', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia', 'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen', 'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather'],

    // Common last names
    lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'],

    // Cities by state
    cities: {
        'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Palo Alto', 'Irvine', 'Pasadena', 'Beverly Hills', 'Santa Monica', 'Cupertino', 'Mountain View', 'Fremont', 'Oakland', 'Berkeley'],
        'NY': ['New York', 'Brooklyn', 'Queens', 'Manhattan', 'Bronx', 'Staten Island', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'White Plains'],
        'TX': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Plano', 'Irving', 'Frisco', 'McKinney', 'The Woodlands'],
        'FL': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'Naples', 'Boca Raton', 'West Palm Beach', 'Coral Gables', 'Miami Beach'],
        'IL': ['Chicago', 'Naperville', 'Evanston', 'Schaumburg', 'Aurora', 'Rockford', 'Joliet', 'Springfield', 'Peoria'],
        'PA': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Lancaster', 'Harrisburg'],
        'OH': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Dublin', 'Westerville'],
        'GA': ['Atlanta', 'Savannah', 'Augusta', 'Columbus', 'Macon', 'Athens', 'Marietta', 'Johns Creek', 'Alpharetta'],
        'NC': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Chapel Hill'],
        'MI': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Flint', 'Troy'],
        'NJ': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Princeton', 'Trenton', 'Hoboken'],
        'VA': ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Arlington', 'Alexandria', 'McLean', 'Fairfax'],
        'WA': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Redmond', 'Kirkland', 'Issaquah'],
        'MA': ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'Newton', 'Brookline'],
        'AZ': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Gilbert', 'Tempe', 'Peoria'],
        'CO': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Boulder', 'Centennial'],
        'TN': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin'],
        'MD': ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie', 'Bethesda', 'Silver Spring'],
        'MN': ['Minneapolis', 'Saint Paul', 'Rochester', 'Bloomington', 'Duluth', 'Brooklyn Park', 'Plymouth'],
        'WI': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha'],
        'MO': ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence', 'Lee Summit'],
        'CT': ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury', 'Greenwich', 'Westport'],
        'OR': ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro', 'Beaverton', 'Lake Oswego'],
        'NV': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City'],
        'UT': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy'],
        'AL': ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa', 'Hoover'],
        'SC': ['Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville'],
        'LA': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles'],
        'KY': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington'],
        'OK': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond'],
        'IA': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City'],
        'KS': ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka'],
        'NE': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney'],
        'NM': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell'],
        'HI': ['Honolulu', 'Pearl City', 'Hilo', 'Kailua', 'Waipahu'],
        'ID': ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello'],
        'WV': ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling'],
        'NH': ['Manchester', 'Nashua', 'Concord', 'Derry', 'Portsmouth'],
        'ME': ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn'],
        'MT': ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Helena'],
        'RI': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence'],
        'DE': ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna'],
        'SD': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown'],
        'ND': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'],
        'AK': ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan'],
        'VT': ['Burlington', 'South Burlington', 'Rutland', 'Barre', 'Montpelier'],
        'WY': ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs'],
        'DC': ['Washington'],
        'AR': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro'],
        'MS': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi'],
        'IN': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers']
    },

    // ZIP code prefixes by state
    zipPrefixes: {
        'AL': ['350', '351', '352', '354', '355', '356', '357', '358', '359', '360', '361', '362', '363', '364', '365', '366', '367', '368', '369'],
        'AK': ['995', '996', '997', '998', '999'],
        'AZ': ['850', '851', '852', '853', '855', '856', '857', '859', '860', '863', '864', '865'],
        'AR': ['716', '717', '718', '719', '720', '721', '722', '723', '724', '725', '726', '727', '728', '729'],
        'CA': ['900', '901', '902', '903', '904', '905', '906', '907', '908', '910', '911', '912', '913', '914', '915', '916', '917', '918', '919', '920', '921', '922', '923', '924', '925', '926', '927', '928', '930', '931', '932', '933', '934', '935', '936', '937', '938', '939', '940', '941', '942', '943', '944', '945', '946', '947', '948', '949', '950', '951', '952', '953', '954', '955', '956', '957', '958', '959', '960', '961'],
        'CO': ['800', '801', '802', '803', '804', '805', '806', '807', '808', '809', '810', '811', '812', '813', '814', '815', '816'],
        'CT': ['060', '061', '062', '063', '064', '065', '066', '067', '068', '069'],
        'DE': ['197', '198', '199'],
        'FL': ['320', '321', '322', '323', '324', '325', '326', '327', '328', '329', '330', '331', '332', '333', '334', '335', '336', '337', '338', '339', '340', '341', '342', '344', '346', '347', '349'],
        'GA': ['300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '398', '399'],
        'HI': ['967', '968'],
        'ID': ['832', '833', '834', '835', '836', '837', '838'],
        'IL': ['600', '601', '602', '603', '604', '605', '606', '607', '608', '609', '610', '611', '612', '613', '614', '615', '616', '617', '618', '619', '620', '622', '623', '624', '625', '626', '627', '628', '629'],
        'IN': ['460', '461', '462', '463', '464', '465', '466', '467', '468', '469', '470', '471', '472', '473', '474', '475', '476', '477', '478', '479'],
        'IA': ['500', '501', '502', '503', '504', '505', '506', '507', '508', '509', '510', '511', '512', '513', '514', '515', '516', '520', '521', '522', '523', '524', '525', '526', '527', '528'],
        'KS': ['660', '661', '662', '664', '665', '666', '667', '668', '669', '670', '671', '672', '673', '674', '675', '676', '677', '678', '679'],
        'KY': ['400', '401', '402', '403', '404', '405', '406', '407', '408', '409', '410', '411', '412', '413', '414', '415', '416', '417', '418', '420', '421', '422', '423', '424', '425', '426', '427'],
        'LA': ['700', '701', '703', '704', '705', '706', '707', '708', '710', '711', '712', '713', '714'],
        'ME': ['039', '040', '041', '042', '043', '044', '045', '046', '047', '048', '049'],
        'MD': ['206', '207', '208', '209', '210', '211', '212', '214', '215', '216', '217', '218', '219'],
        'MA': ['010', '011', '012', '013', '014', '015', '016', '017', '018', '019', '020', '021', '022', '023', '024', '025', '026', '027'],
        'MI': ['480', '481', '482', '483', '484', '485', '486', '487', '488', '489', '490', '491', '492', '493', '494', '495', '496', '497', '498', '499'],
        'MN': ['550', '551', '553', '554', '555', '556', '557', '558', '559', '560', '561', '562', '563', '564', '565', '566', '567'],
        'MS': ['386', '387', '388', '389', '390', '391', '392', '393', '394', '395', '396', '397'],
        'MO': ['630', '631', '633', '634', '635', '636', '637', '638', '639', '640', '641', '644', '645', '646', '647', '648', '649', '650', '651', '652', '653', '654', '655', '656', '657', '658'],
        'MT': ['590', '591', '592', '593', '594', '595', '596', '597', '598', '599'],
        'NE': ['680', '681', '683', '684', '685', '686', '687', '688', '689', '690', '691', '692', '693'],
        'NV': ['889', '890', '891', '893', '894', '895', '897', '898'],
        'NH': ['030', '031', '032', '033', '034', '035', '036', '037', '038'],
        'NJ': ['070', '071', '072', '073', '074', '075', '076', '077', '078', '079', '080', '081', '082', '083', '084', '085', '086', '087', '088', '089'],
        'NM': ['870', '871', '872', '873', '874', '875', '877', '878', '879', '880', '881', '882', '883', '884'],
        'NY': ['100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '140', '141', '142', '143', '144', '145', '146', '147', '148', '149'],
        'NC': ['270', '271', '272', '273', '274', '275', '276', '277', '278', '279', '280', '281', '282', '283', '284', '285', '286', '287', '288', '289'],
        'ND': ['580', '581', '582', '583', '584', '585', '586', '587', '588'],
        'OH': ['430', '431', '432', '433', '434', '435', '436', '437', '438', '439', '440', '441', '442', '443', '444', '445', '446', '447', '448', '449', '450', '451', '452', '453', '454', '455', '456', '457', '458'],
        'OK': ['730', '731', '734', '735', '736', '737', '738', '739', '740', '741', '743', '744', '745', '746', '747', '748', '749'],
        'OR': ['970', '971', '972', '973', '974', '975', '976', '977', '978', '979'],
        'PA': ['150', '151', '152', '153', '154', '155', '156', '157', '158', '159', '160', '161', '162', '163', '164', '165', '166', '167', '168', '169', '170', '171', '172', '173', '174', '175', '176', '177', '178', '179', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189', '190', '191', '192', '193', '194', '195', '196'],
        'RI': ['028', '029'],
        'SC': ['290', '291', '292', '293', '294', '295', '296', '297', '298', '299'],
        'SD': ['570', '571', '572', '573', '574', '575', '576', '577'],
        'TN': ['370', '371', '372', '373', '374', '375', '376', '377', '378', '379', '380', '381', '382', '383', '384', '385'],
        'TX': ['750', '751', '752', '753', '754', '755', '756', '757', '758', '759', '760', '761', '762', '763', '764', '765', '766', '767', '768', '769', '770', '771', '772', '773', '774', '775', '776', '777', '778', '779', '780', '781', '782', '783', '784', '785', '786', '787', '788', '789', '790', '791', '792', '793', '794', '795', '796', '797', '798', '799'],
        'UT': ['840', '841', '842', '843', '844', '845', '846', '847'],
        'VT': ['050', '051', '052', '053', '054', '056', '057', '058', '059'],
        'VA': ['201', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', '243', '244', '245', '246'],
        'WA': ['980', '981', '982', '983', '984', '985', '986', '988', '989', '990', '991', '992', '993', '994'],
        'WV': ['247', '248', '249', '250', '251', '252', '253', '254', '255', '256', '257', '258', '259', '260', '261', '262', '263', '264', '265', '266', '267', '268'],
        'WI': ['530', '531', '532', '534', '535', '537', '538', '539', '540', '541', '542', '543', '544', '545', '546', '547', '548', '549'],
        'WY': ['820', '821', '822', '823', '824', '825', '826', '827', '828', '829', '830', '831'],
        'DC': ['200', '202', '203', '204', '205']
    },

    // Helper functions
    random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    generateZipCode(stateCode) {
        const prefixes = this.zipPrefixes[stateCode] || ['100'];
        const prefix = this.random(prefixes);
        const suffix = String(this.randomNumber(0, 99)).padStart(2, '0');
        return prefix + suffix;
    },

    generatePhoneNumber(stateCode) {
        const state = this.states[stateCode];
        const areaCode = this.random(state.areaCodes);
        const exchange = this.randomNumber(200, 999);
        const subscriber = this.randomNumber(1000, 9999);
        return `(${areaCode}) ${exchange}-${subscriber}`;
    },

    generateAddress(stateCode) {
        const streetNumber = this.randomNumber(100, 9999);
        const streetName = this.random(this.streetNames);
        const streetType = this.random(this.streetTypes);
        return `${streetNumber} ${streetName} ${streetType}`;
    },

    generateCity(stateCode) {
        const cities = this.cities[stateCode];
        if (cities && cities.length > 0) {
            return this.random(cities);
        }
        return this.random(Object.values(this.cities).flat());
    },

    generateName() {
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const firstName = gender === 'male'
            ? this.random(this.maleNames)
            : this.random(this.femaleNames);
        const lastName = this.random(this.lastNames);
        return { firstName, lastName, fullName: `${firstName} ${lastName}`, gender };
    },

    generateDateOfBirth(minAge = 14, maxAge = 18) {
        const today = new Date();
        const age = this.randomNumber(minAge, maxAge);
        const year = today.getFullYear() - age;
        const month = this.randomNumber(1, 12);
        const day = this.randomNumber(1, 28);
        return {
            date: new Date(year, month - 1, day),
            formatted: `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`
        };
    },

    // Main generate function
    generate(stateCode = null) {
        // If no state specified, pick random
        const states = Object.keys(this.states);
        const selectedState = stateCode || this.random(states);
        const stateName = this.states[selectedState].name;

        const name = this.generateName();
        const address = this.generateAddress(selectedState);
        const city = this.generateCity(selectedState);
        const zipCode = this.generateZipCode(selectedState);
        const phone = this.generatePhoneNumber(selectedState);
        const dob = this.generateDateOfBirth();

        return {
            name: name.fullName,
            firstName: name.firstName,
            lastName: name.lastName,
            gender: name.gender,
            address: address,
            city: city,
            state: selectedState,
            stateName: stateName,
            zipCode: zipCode,
            fullAddress: `${address}, ${city}, ${selectedState} ${zipCode}`,
            phone: phone,
            dateOfBirth: dob.formatted,
            dateOfBirthDate: dob.date
        };
    },

    // Generate address matching a specific school's location
    generateForSchool(school) {
        if (!school) {
            return this.generate();
        }

        const stateCode = school.state;
        const stateName = this.states[stateCode]?.name || school.state;

        const name = this.generateName();
        const address = this.generateAddress(stateCode);
        const phone = this.generatePhoneNumber(stateCode);
        const dob = this.generateDateOfBirth();

        // Use school's city and ZIP for precise location matching
        return {
            name: name.fullName,
            firstName: name.firstName,
            lastName: name.lastName,
            gender: name.gender,
            address: address,
            city: school.city,  // Use school's city
            state: stateCode,
            stateName: stateName,
            zipCode: school.zip,  // Use school's ZIP code
            fullAddress: `${address}, ${school.city}, ${stateCode} ${school.zip}`,
            phone: phone,
            dateOfBirth: dob.formatted,
            dateOfBirthDate: dob.date
        };
    },

    // Get all states for dropdown
    getStates() {
        return Object.entries(this.states).map(([code, data]) => ({
            code,
            name: data.name
        })).sort((a, b) => a.name.localeCompare(b.name));
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AddressGenerator;
}
