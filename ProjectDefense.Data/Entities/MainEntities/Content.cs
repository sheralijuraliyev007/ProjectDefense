using ProjectDefense.Data.Entities.InfoEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("contents")]
    public class Content
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("public_id")]
        public string PublicId { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        [Column("secure_url")]
        public string SecureUrl { get; set; } = string.Empty;

        [Required]
        [Column("original_filename")]
        [MaxLength(255)]
        public string OriginalFilename { get; set; } = string.Empty;

        [Required]
        [Column("content_type_code")]
        public short ContentTypeCode { get; set; }

        [ForeignKey(nameof(ContentTypeCode))]
        public virtual ContentType? ContentType { get; set; }

        [Required]
        [Column("width")]
        public int Width { get; set; }

        [Required]
        [Column("height")]
        public int Height { get; set; }

        [Required]
        [Column("status_code")]
        public short StatusCode { get; set; }

        [ForeignKey(nameof(StatusCode))]
        public virtual CommonStatus? Status { get; set; }

        [Column("size_bytes")]
        [Required]
        public long SizeBytes { get; set; }

       
    }
}
