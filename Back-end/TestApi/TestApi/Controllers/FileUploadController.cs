using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Description;
using TestApi.Models;

namespace TestApi.Controllers
{
    [BasicAuthentication]
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class FileUploadController : ApiController
    {
        private TestApiEntities2 db = new TestApiEntities2();

        public IEnumerable<MyFile> Get()
        {
            return db.MyFiles.ToList();
        }

        [HttpGet]
        [Route("api/FileDownloading/Download")]
        public HttpResponseMessage Download(string fileName)
        {
            var result = new HttpResponseMessage(HttpStatusCode.OK);

            string fileServerName = db.MyFiles.SingleOrDefault(f => f.FileName == fileName).FileServerName;
            fileName = fileName.Trim(' ');

            var filePath = HttpContext.Current.Server.MapPath($"~/Uploads/Files/Stream/{fileServerName}");

            var fileBytes = File.ReadAllBytes(filePath);

            var fileMemStream = new MemoryStream(fileBytes);

            result.Content = new StreamContent(fileMemStream);

            var headers = result.Content.Headers;
            headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");

            headers.ContentDisposition.FileName = fileName;
            headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            headers.ContentLength = fileMemStream.Length;

            return result;
        }

        public async Task<HttpResponseMessage> Post(HttpRequestMessage request)
        {
            bool v = await Upload();
            return v
                ? request.CreateResponse(HttpStatusCode.OK, new
                {
                    success = true,
                    msg = "UploadSuccess"
                })
                : request.CreateResponse(HttpStatusCode.BadRequest, new
                {
                    success = false,
                    msg = "UploadFailed"
                });
        }

        private async Task<bool> Upload()
        {
            //try
            //{
            var ctx = HttpContext.Current;

            var root = ctx.Server.MapPath("~/Uploads/Files/Stream");
            var provider = new MultipartFormDataStreamProvider(root);

            await Request.Content.ReadAsMultipartAsync(provider);

            foreach (var file in provider.FileData)
            {
                string name = file.Headers.ContentDisposition.FileName;

                //remove double quotes from name.
                name = name.Trim('"');

                var localFileName = file.LocalFileName;
                string fileServerName = Guid.NewGuid().ToString();
                var filePath = Path.Combine(root, fileServerName);

                string type = "";
                string extention = name.Split('.').Last().ToLower();
                switch (extention)
                {
                    case "pdf":
                        type = "pdf";
                        break;
                    case "xlsx":
                        type = "excel";
                        break;
                    case "xls":
                        type = "excel";
                        break;
                    default:
                        type = "document";
                        break;
                }

                File.Move(localFileName, filePath);
                db.MyFiles.Add(new MyFile { FileName = name, ModifiedDate = DateTime.Now, FileServerName = fileServerName, Type=type });
                db.SaveChanges();
            }
            return true;
            //}
            //catch
            //{
            //    return false;
            //}
        }

        // DELETE: api/MyFiles/5
        [ResponseType(typeof(MyFile))]
        public async Task<IHttpActionResult> DeleteMyFile(string id)
        {
            MyFile myFile = await db.MyFiles.FindAsync(id);
            if (myFile == null)
            {
                return NotFound();
            }

            db.MyFiles.Remove(myFile);
            await db.SaveChangesAsync();

            return Ok(myFile);
        }

    }
}
