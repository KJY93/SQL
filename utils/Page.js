// Declaring SQL query
const SQL_FIND_BY_NAME = 'SELECT * FROM apps WHERE name like ? limit ? offset ?' 
const SQL_FIND_BY_NAME_COUNT = 'SELECT COUNT(*) as count FROM apps WHERE name like ?' 


module.exports = async function getPage (res, conn, q, currOffsetIndex, prevOffsetIndex, nextOffsetIndex) {

    // Query DB with q, LIMIT and offset
    const [recs, _] = await conn.query(SQL_FIND_BY_NAME, [ `%${q}%`, 10, currOffsetIndex])

    // Query DB to get total count for that query term
    const [recsCount, __] = await conn.query(SQL_FIND_BY_NAME_COUNT, [ `%${q}%`])

    res.status(200)
    res.type('text/html')
    res.render('result', {
        recs,
        hasContent: recs.length > 0,
        field: recs.length > 0 ? Object.keys(recs[0]) : [],
        q,
        currOffsetIndex: currOffsetIndex !== 0 && 1, // for first page (to display the next button and without the prev button)
        prevOffsetIndex: `/prev/${q}/${prevOffsetIndex}`, // href link to previous page
        nextOffsetIndex: `/next/${q}/${nextOffsetIndex}`, // href link to next page 
        isNotEnd: ((Math.floor(recsCount[0]['count'] / 10) > (nextOffsetIndex / 10))) && 1 , // do not display next button if the current page is the last page
    })

}
