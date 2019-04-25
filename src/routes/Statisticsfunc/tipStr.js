const funcitonStr = `CREATE OR REPLACE FUNCTION "public"."crm_func_analyse_func_count"(IN "_userno" int4, OUT "countnum" int4)

RETURNS "pg_catalog"."int4" AS $BODY$

DECLARE

_execute_sql TEXT:='';


BEGIN

        _execute_sql:='SELECT COUNT(1) FROM crm_sys_userinfo';

  EXECUTE _execute_sql INTO countnum;

END;

$BODY$

LANGUAGE plpgsql VOLATILE

COST 100;`;

const funcitonStr2 = `CREATE OR REPLACE FUNCTION "public"."crm_func_analyse_func_count_list"("_pageindex" int4, "_pagesize" int4, "_userno" int4)

RETURNS SETOF "pg_catalog"."refcursor" AS $BODY$



DECLARE



_sql_where TEXT:='';

_execute_sql TEXT;

_listtype_sql TEXT;

_month_sql TEXT;

_udeptid uuid;



_starttime DATE;

_stoptime DATE;



_column_names TEXT[];

   _column_sql TEXT;

--分页标准参数

_page_sql TEXT;

_count_sql TEXT;

_columncursor refcursor:='columncursor';

_datacursor refcursor:= 'datacursor';

_pagecursor refcursor:= 'pagecursor';



BEGIN

 

 _execute_sql:=format('

                  SELECT jsonb_set(''{}''::jsonb,''{detail}'',jsonb_build_array(cola,colb,colc,cold)) AS record FROM (

                            SELECT userid::TEXT AS cola,userphone AS colb,(CASE WHEN usersex = 0 THEN ''男'' ELSE ''女'' END) AS colc,usericon AS cold FROM crm_sys_userinfo

                  ) AS t

      ',_sql_where,_listtype_sql,_month_sql);



  RAISE NOTICE '%',_execute_sql;



  --字段映射名称

  _column_names:=array_append(_column_names, '商机标题');

  _column_names:=array_append(_column_names, '商机名称');

  _column_names:=array_append(_column_names, '商机数据');

  _column_names:=array_append(_column_names, '商机跟进');

        _column_sql:=format('SELECT %s AS columnmap',quote_literal(array_to_string(_column_names, ',')));



      --查询分页数据

   SELECT * FROM crm_func_paging_sql_fetch(_execute_sql, _pageindex, _pagesize) INTO _page_sql,_count_sql;



OPEN _datacursor FOR EXECUTE _page_sql;

   RETURN NEXT _datacursor;



   OPEN _pagecursor FOR EXECUTE _count_sql;

   RETURN NEXT _pagecursor;



   OPEN _columncursor FOR EXECUTE _column_sql;

   RETURN NEXT _columncursor;



END

$BODY$

LANGUAGE plpgsql VOLATILE

COST 100

ROWS 1000;`;

export default {
  funcitonStr,
  funcitonStr2
};
