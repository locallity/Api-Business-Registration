const db = require('../database/db');

exports.selectAll = (req, res) => {
  
  const page = req.query.page || 1;
  const limit = req.query.limit || 10; 

  console.log(req.query)
  const offset = (page - 1) * limit;

  const countQuery = 'SELECT COUNT(*) AS total_count FROM negocio'; // Query to get the total count of records

  const selectQuery = `
    SELECT negocio.*, GROUP_CONCAT(DISTINCT images.image_url) AS image_urls, logos.logo_url
    FROM negocio
    LEFT JOIN images ON negocio.id_business = images.id_business
    LEFT JOIN logos ON negocio.id_business = logos.id_business
    GROUP BY negocio.id_business, logos.logo_url
    LIMIT ${limit}
    OFFSET ${offset}
  `; 

  db.query(countQuery, (countErr, countResult) => {
    if (countErr) {
      return res.status(500).json({ message: 'Failed to retrieve data count', error: countErr });
    }

    const totalCount = countResult[0].total_count; 
    db.query(selectQuery, (selectErr, data) => {
      if (selectErr) {
        return res.status(500).json({ message: 'Failed to retrieve data', error: selectErr });
      }

      if (data.length > 0) {
        res.status(200).json({
          message: 'Paginated Business Data',
          data: data,
          page: page,
          limit: limit,
          total_count: totalCount
        });
      } else {
        res.status(404).json({ message: 'No Business Data Available!' });
      }
    });
  });
};

exports.searchBar=(req, res)=>{


  const name = req.body['name'];
  const searchSql = `SELECT * FROM negocio WHERE name LIKE '%${name}%'`;
  db.query(searchSql,(err, data)=>{


    if(err){

      res.status(500).json({ message: 'Failed to retrieve data', error: err });

    }else if(data.length === 0){

      res.status(404).json({ message: 'No Business Data Available!' });

    }else{

      res.status(200).json({
        message: 'Business Data',
        data: data,
      });

    }



  })


}

exports.filter = (req, res) => {
  const shipping = req.body['shipping'];
  const bill = req.body['bill'];
  const physical_store = req.body['physical_store'];
  const online_store = req.body['online_store'];
  const category = req.body['category'];
  const subcategory = req.body['subcategory'];
  const is_owner_verified = req.body['is_owner_verified'];
  const page = req.body['page'] || 1;
  const limit = req.body['limit'] || 100;


  let filterQuery = `SELECT n.*, GROUP_CONCAT(i.image_url) AS image_urls, MAX(l.logo_url) AS logo_url
    FROM negocio n
    JOIN images i ON n.id_business = i.id_business
    JOIN logos l ON n.id_business = l.id_business
    WHERE 1 = 1`;

  const values = [];

  if (shipping !== undefined) {
    filterQuery +='  AND n.shipping = ?';
    values.push(shipping);
  }

  if (physical_store !== undefined) {
    filterQuery +='  AND (n.physical_store IS NULL OR n.physical_store = ?)';
    values.push(physical_store);
  }

  if (online_store !== undefined) {
    filterQuery +='  AND (n.online_store IS NULL OR n.online_store = ?)';
    values.push(online_store);
  }

  if (is_owner_verified !== undefined) {
    filterQuery +='  AND (n.is_owner_verified IS NULL OR n.is_owner_verified = ?)';
    values.push(is_owner_verified);
  }

  if (subcategory !== undefined) {
    filterQuery +=' AND (n.subcategory = ? OR n.subcategory IS NULL)' ;
    values.push(subcategory);
  }

  if (category !== undefined) {
    filterQuery +=' AND (n.category = ? OR n.category IS NULL)';
    values.push(category);
  }

  if (bill !== undefined) {
    filterQuery +='  AND (n.bill IS NULL OR n.bill = ?)';
    values.push(bill);
  }

  filterQuery +=  'GROUP BY n.id_business'

  // Aplicar paginación
  if (page !== undefined && limit !== undefined) {
    const offset = (page - 1) * limit
    // console.log(offset);
    filterQuery +=` LIMIT ${limit} OFFSET ${offset}`   
    // values.push(limit, offset)
  }

  db.query(filterQuery, values, (err, data) => {
    if (err) {
      res.status(500).json({ message: 'Failed to retrieve data', error: err });
    } else if (data.length === 0) {
      res.status(404).json({ message: 'No Business Data Available!' });
    } else {
      const response = {
        message: 'Filter Business Data',
        data: data,
        page: page,
        limit: limit,
        total_count: data.length
      };
      res.status(200).json(response);
    }
  });
};
