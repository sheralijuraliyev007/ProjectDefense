using ProjectDefense.Data.Entities.BaseEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("project_tags")]
    public class ProjectTag : BaseEntity
    {
        [Required]
        [Column("project_id")]
        public int ProjectId { get; set; }

        [ForeignKey(nameof(ProjectId))]
        public virtual Project? Project { get; set; }

        [Required]
        [Column("tag_id")]
        public int TagId { get; set; }

        [ForeignKey(nameof(TagId))]
        public virtual Tag? Tag { get; set; }
    }
}
