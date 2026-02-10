
using Demo.Entities;
using Demo.Repository.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Data.Common;
using System.Dynamic;
using System.Linq.Expressions;

namespace Demo.Repository
{
    public class Repository<T> : IRepository<T>
        where T : BaseEntity
    {
        private readonly DbContext _context;
        private readonly DbSet<T> _dbset;

        public Repository(DbContext context)
        {
            _context = context;
            _dbset = _context.Set<T>();
        }

        public IQueryable<T> Entity(params Expression<Func<T, object>>[] navigations)
        {
            IQueryable<T> query = _dbset;

            if (navigations == null || navigations.Length == 0)
                return query;

            return navigations.Aggregate(query, (current, navigation) => current.Include(navigation));
        }

        // --------------------------------------------------------------------
        // EXECUTE PROCEDURE USING EF CORE
        // --------------------------------------------------------------------
        public IEnumerable<T> ExecuteProcedure(string procedureName, DbParameter[] parameters)
        {
            return _context.Set<T>().FromSqlRaw(procedureName, parameters).ToList();
        }

        // --------------------------------------------------------------------
        // EXECUTE STORED PROCEDURE USING NATIVE ADO.NET
        // --------------------------------------------------------------------
        public IList<TItem> ExecuteQuery<TItem>(string commandText, DbParameter[] parameters)
        {
            List<TItem> output;

            using (var connection = _context.Database.GetDbConnection())
            {
                if (connection.State != ConnectionState.Open)
                    connection.Open();

                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = commandText;
                    cmd.CommandType = CommandType.StoredProcedure;

                    foreach (var p in parameters)
                        cmd.Parameters.Add(p);

                    using (var reader = cmd.ExecuteReader())
                    {
                        output = reader.MapDataReaderToList<TItem>();
                    }
                }
            }

            return output;
        }

        // --------------------------------------------------------------------
        // EXECUTE SQL COMMAND RETURNING MULTIPLE RESULT SETS
        // --------------------------------------------------------------------
        public List<object> ExecuteSqlCommand(string sql, params object[] parameters)
        {
            var output = new List<object>();

            using (var connection = _context.Database.GetDbConnection())
            {
                if (connection.State != ConnectionState.Open)
                    connection.Open();

                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = sql;
                    cmd.CommandType = CommandType.StoredProcedure;

                    foreach (var p in parameters)
                        cmd.Parameters.Add(p);

                    using (var reader = cmd.ExecuteReader())
                    {
                        output.Add(reader.MapDataReaderToDictionary());

                        while (reader.NextResult())
                            output.Add(reader.MapDataReaderToDictionary());
                    }
                }
            }

            return output;
        }

        // --------------------------------------------------------------------
        // EXECUTE DYNAMIC QUERY (YOUR CUSTOM METHOD)
        // FIXED: NO RETURN INSIDE USING BLOCK
        // FIXED: CONNECTION DISPOSED PROPERLY
        // --------------------------------------------------------------------
        public IEnumerable<dynamic> ExecuteDynamicQuery(string commandText)
        {
            var dynamicDs = new List<dynamic>();

            using (var connection = _context.Database.GetDbConnection())
            {
                if (connection.State != ConnectionState.Open)
                    connection.Open();

                using (var command = connection.CreateCommand())
                {
                    command.CommandText = commandText;
                    command.CommandTimeout = 0;

                    var ds = new DataSet();
                    var da = new SqlDataAdapter { SelectCommand = (SqlCommand)command };
                    da.Fill(ds);

                    foreach (DataTable dt in ds.Tables)
                    {
                        var dynamicDt = new List<dynamic>();

                        foreach (DataRow row in dt.Rows)
                        {
                            dynamic dyn = new ExpandoObject();
                            var dic = (IDictionary<string, object>)dyn;

                            foreach (DataColumn col in dt.Columns)
                                dic[col.ColumnName] = row[col];

                            dynamicDt.Add(dyn);
                        }

                        dynamicDs.Add(dynamicDt);
                    }
                }
            }

            return dynamicDs;
        }

        // --------------------------------------------------------------------
        // EXECUTE QUERY RETURNING DATASET
        // FIXED: NO RETURN INSIDE USING BLOCK
        // --------------------------------------------------------------------
        public DataSet ExecuteQuery(string commandText)
        {
            var ds = new DataSet();

            using (var connection = _context.Database.GetDbConnection())
            {
                if (connection.State != ConnectionState.Open)
                    connection.Open();

                using (var command = connection.CreateCommand())
                {
                    command.CommandText = commandText;
                    command.CommandTimeout = 0;

                    var da = new SqlDataAdapter { SelectCommand = (SqlCommand)command };
                    da.Fill(ds);
                }
            }

            return ds;
        }

        // --------------------------------------------------------------------
        // BASIC CRUD
        // --------------------------------------------------------------------
        public void Add(T entity) => _dbset.Add(entity);

        public void AddRange(IEnumerable<T> entities) => _dbset.AddRange(entities);

        public void Delete(T entity)
        {
            if (_context.Entry(entity).State == EntityState.Detached)
                _dbset.Attach(entity);

            _dbset.Remove(entity);
        }

        public void DeleteRange(IEnumerable<T> entities)
        {
            var list = entities.ToList();

            foreach (var entity in list.Where(e => _context.Entry(e).State == EntityState.Detached))
                _dbset.Attach(entity);

            _dbset.RemoveRange(list);
        }
    }
}


//using Demo.Entities;
//using Demo.Repository.Interfaces;
//using Microsoft.Data.SqlClient;
//using Microsoft.EntityFrameworkCore;
//using System.Data;
//using System.Data.Common;
//using System.Dynamic;
//using System.Linq.Expressions;

//namespace Demo.Repository
//{
//    public class Repository<T> : IRepository<T>
//        where T : BaseEntity
//    {
//        private readonly DbContext _context;
//        private readonly DbSet<T> _dbset;
//        // private readonly short CommandTimeoutSecondsCount;        

//        ///<summary>      
//        ///  Initializes a new instance of the <seecref="Repository{T}"/> class.      
//        ///  </summary>   
//        ///  <param name="context">The database context.</param>       

//        public Repository(DbContext context)
//        {
//            _context = context;
//            _dbset = _context.Set<T>();
//            //CommandTimeoutSecondsCount = Convert.ToInt16(ConfigurationManager.AppSettings["CommandTimeout"]);          
//            // _context.Database.SetCommandTimeout(CommandTimeoutSecondsCount);      
//        }

//        ///<summary>       
//        /// Searches for entities of specified type       
//        /// </summary>       
//        /// <typeparam name="T">Type of entity to search</typeparam>       
//        /// <param name="navigations">Expressions used to include complex properties</param>       
//        /// <returns>Entity set for the specified type</returns>       

//        public IQueryable<T> Entity(params Expression<Func<T, object>>[] navigations)
//        {
//            IQueryable<T> query = _dbset;
//            if (navigations == null || navigations.Length == 0)
//            {
//                return query;
//            }

//            return navigations.Aggregate(query, (current, navigation) => current.Include(navigation));
//        }

//        ///<summary>       
//        ///Execute stored procedure can be used while executing storedproces with dbcontext       
//        ///</summary>       
//        ///<typeparam name="TItem"></typeparam>       
//        ///<param name="procedureName"></param>      
//        ///<param name="parameters"></param>       
//        ///<returns></returns>       

//        public IEnumerable<T> ExecuteProcedure(string procedureName, DbParameter[] parameters)
//        {
//            var parameterString = string.Join(", ", parameters.Select(parameter => parameter.ParameterName));
//            var commandTextWithParams = procedureName + (!string.IsNullOrEmpty(parameterString) ? " " + parameterString : parameterString);
//            return _context.Set<T>().FromSqlRaw(procedureName, parameters).ToList();
//        }

//        ///<summary>       
//        ///Executes the query. if native .netsql calls should be made please use below code      
//        ///</summary>       
//        ///<typeparam name="TItem">Entity type</typeparam>       
//        ///<param name="commandText">The command text.</param>       
//        ///<param name="parameters">The parameters.</param>       
//        ///<returns>A list of entities</returns>       

//        public IList<TItem> ExecuteQuery<TItem>(string commandText, DbParameter[] parameters)
//        {
//            List<TItem> output;
//            _context.Database.OpenConnection();
//            try
//            {
//                using (var cmd = _context.Database.GetDbConnection().CreateCommand())
//                {
//                    //cmd.CommandTimeout = CommandTimeoutSecondsCount;                   
//                    cmd.CommandText = commandText;
//                    cmd.CommandType = CommandType.StoredProcedure;
//                    foreach (var item in parameters)
//                    {
//                        cmd.Parameters.Add(item);
//                    }

//                    var reader = cmd.ExecuteReader();
//                    output = reader.MapDataReaderToList<TItem>();

//                    reader.Close();
//                }
//            }
//            finally
//            {
//                _context.Database.CloseConnection();
//            }

//            return output;
//        }

//        ///<summary>       
//        /// Executes the SQL command. if native .netsql calls should be made please use below code       
//        /// </summary>       
//        /// <param name="sql">The SQL.</param>       
//        /// <param name="parameters">The parameters.</param>       
//        /// <returns>A list of objects</returns>       

//        public List<object> ExecuteSqlCommand(string sql, params object[] parameters)
//        {
//            List<object> output = new List<object>();
//            _context.Database.OpenConnection();
//            try
//            {
//                using (var cmd = _context.Database.GetDbConnection().CreateCommand())
//                {
//                    cmd.CommandText = sql;
//                    cmd.CommandType = CommandType.StoredProcedure;
//                    //cmd.CommandTimeout = CommandTimeoutSecondsCount;                   
//                    foreach (var item in parameters)
//                    {
//                        cmd.Parameters.Add(item);
//                    }

//                    var reader = cmd.ExecuteReader();
//                    output.Add(reader.MapDataReaderToDictionary());
//                    // nth result sets                   
//                    while (reader.NextResult())
//                    {
//                        output.Add(reader.MapDataReaderToDictionary());
//                    }
//                    reader.Close();
//                }
//            }
//            finally
//            {
//                _context.Database.CloseConnection();
//            }

//            return output;

//        }

//        ///<summary>       
//        /// Adds entity to the set.       
//        ///</summary>       
//        ///<param name="entity">Entity to add.</param>       

//        public void Add(T entity)
//        {
//            _dbset.Add(entity);
//        }

//        ///<summary>       
//        ///Adds entity list to the set.       
//        ///</summary>       
//        ///<param name="entities">Entity list to add.</param>       

//        public void AddRange(IEnumerable<T> entities)
//        {
//            _dbset.AddRange(entities);
//        }

//        ///<summary>       
//        ///Deletes entity from the set.       
//        ///</summary>       
//        ///<param name="entity">Entity to delete.</param>       

//        public void Delete(T entity)
//        {
//            if (_context.Entry(entity).State == EntityState.Detached)
//            {
//                _dbset.Attach(entity);
//            }

//            _dbset.Remove(entity);
//        }

//        ///<summary>       
//        ///Deletes entity list from the set.       
//        ///</summary>       
//        ///<param name="entities">Entity list to delete.</param>       
//        public void DeleteRange(IEnumerable<T> entities)
//        {
//            var entityList = entities as IList<T> ?? entities.ToList();
//            var detached = entityList.Where(entity => _context.Entry(entity).State == EntityState.Detached);
//            foreach (var item in detached)
//            {
//                _dbset.Attach(item);
//            }
//            _dbset.RemoveRange(entityList);
//        }

//        public IEnumerable<dynamic> ExecuteDynamicQuery(string commandText)
//        {
//            var dynamicDs = new List<dynamic>();
//            var connection = _context.Database.GetDbConnection();
//            if(connection.State != ConnectionState.Open)
//                connection.Open();
//            using (var command = connection.CreateCommand())
//            {
//                DataSet ds = new DataSet();
//                command.CommandText = commandText;
//                command.Connection = connection;
//                command.CommandTimeout = 0;

//                DbDataAdapter da = new SqlDataAdapter();
//                da.SelectCommand = command;
//                da.Fill(ds);
//                foreach (DataTable dt in ds.Tables)
//                {
//                    var dynamicDt = new List<dynamic>();    
//                    foreach(DataRow row in dt.Rows)
//                    {
//                        dynamic dyn = new ExpandoObject();
//                        dynamicDt.Add(dyn);
//                        foreach (DataColumn column in dt.Columns)
//                        {
//                            var dic = (IDictionary<string, object>)dyn;
//                            dic[column.ColumnName] = row[column];
//                        }
//                    }
//                    dynamicDs.Add(dynamicDt);
//                }
//                return dynamicDs;
//            }
//        }

//        public DataSet ExecuteQuery(string commandText)
//        {
//            var connection = _context.Database.GetDbConnection();
//            if (connection.State != ConnectionState.Open)
//                connection.Open();
//            using (var command = connection.CreateCommand())
//            {
//                DataSet ds = new DataSet();
//                command.CommandText = commandText;
//                command.Connection = connection;
//                command.CommandTimeout = 0;

//                DbDataAdapter da = new SqlDataAdapter();
//                da.SelectCommand = command;
//                da.Fill(ds);

//                return ds;
//            }
//        }
//    }
//}
