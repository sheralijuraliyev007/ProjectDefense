using ProjectDefense.Data.Entities.BaseEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace ProjectDefense.Data.Entities.MainEntities
{
    [Table("position_project_tags")]
    public class PositionProjectTag : BaseEntity
    {
        [Required]
        [Column("position_id")]
        public int PositionId { get; set; }

        [ForeignKey(nameof(PositionId))]
        public virtual Position? Position { get; set; }

        [Required]
        [Column("tag_id")]
        public int TagId { get; set; }

        [ForeignKey(nameof(TagId))]
        public virtual Tag? Tag { get; set; }
    }
}
