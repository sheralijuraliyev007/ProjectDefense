using ProjectDefense.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("cv_projects")]
    public class CvProject : BaseEntity
    {
        [Required]
        [Column("cv_id")]
        public long CvId { get; set; }

        [ForeignKey(nameof(CvId))]
        public virtual CV? CV { get; set; }

        [Required]
        [Column("project_id")]
        public int ProjectId { get; set; }

        [ForeignKey(nameof(ProjectId))]
        public virtual Project? Project { get; set; }
    }
}